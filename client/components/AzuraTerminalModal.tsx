import React, { useEffect, useMemo, useRef, useState } from "react";

interface AzuraTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: string[];
  onComplete?: () => void;
  autoProceedDelayMs?: number;
}

export const AzuraTerminalModal: React.FC<AzuraTerminalModalProps> = ({
  isOpen,
  onClose,
  messages,
  onComplete,
  autoProceedDelayMs = 600,
}) => {
  const [output, setOutput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const timers = useRef<number[]>([]);

  // Build a full script with line prefixes
  const script = useMemo(() => {
    return messages.map((m) => `> ${m}`).join("\n");
  }, [messages]);

  useEffect(() => {
    if (!isOpen) return;
    setOutput("");
    setIsTyping(true);

    let idx = 0;
    const type = () => {
      if (idx >= script.length) {
        setIsTyping(false);
        const doneTimer = window.setTimeout(() => {
          onComplete?.();
          onClose();
        }, autoProceedDelayMs);
        timers.current.push(doneTimer);
        return;
      }
      setOutput((p) => p + script[idx]);
      idx += 1;
      const t = window.setTimeout(type, 18);
      timers.current.push(t);
    };

    const start = window.setTimeout(type, 250);
    timers.current.push(start);

    return () => {
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
    };
  }, [isOpen, script, onClose, onComplete, autoProceedDelayMs]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl mx-auto max-h-[95vh] flex flex-col">
        <div
          className="relative bg-black border border-white/30 shadow-2xl overflow-hidden"
          style={{
            clipPath:
              "polygon(16px 0%, 100% 0%, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0% 100%, 0% 16px)",
          }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between p-3 border-b border-white/20 bg-black/80">
            <div className="text-white font-cartograph text-sm">azura.exe</div>
            <button
              onClick={onClose}
              className="px-3 py-1 text-white/80 border border-white/30 rounded hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          {/* Terminal body */}
          <div className="p-4 bg-black">
            <div className="text-xs text-white/60 font-cartograph mb-2">
              /usr/bin/azura
            </div>
            <div
              className="font-cartograph text-white/90 bg-white/5 border border-white/20 rounded p-4 min-h-[160px] whitespace-pre-wrap"
              style={{ lineHeight: 1.5 }}
            >
              {output}
              {isTyping && (
                <span className="inline-block w-2 h-4 align-baseline bg-white animate-pulse ml-1" />
              )}
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => {
                  onComplete?.();
                  onClose();
                }}
                className="px-3 py-1 text-black bg-white hover:bg-gray-200 rounded border border-white/20"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AzuraTerminalModal;