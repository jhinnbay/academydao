import React, { useState, useEffect } from "react";
import { SoundEffects } from "@/lib/soundEffects";
import { ScrollLock } from "@/lib/scrollLock";

interface InputRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: "funding" | "events"; content: string }) => void;
}

export const InputRequestModal: React.FC<InputRequestModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"funding" | "events">("events");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Lock/unlock scroll when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      ScrollLock.lock();
    } else {
      ScrollLock.unlock();
    }

    // Cleanup on unmount
    return () => {
      if (isOpen) {
        ScrollLock.unlock();
      }
    };
  }, [isOpen]);

  const handleSave = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    SoundEffects.playGenerateSound();

    // Simulate save delay
    setTimeout(() => {
      onSave({ type: activeTab, content: content.trim() });
      setIsSaving(false);
      setContent("");
      onClose();
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    SoundEffects.playTypingSound();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ top: "0", left: "0", position: "fixed" }}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onScroll={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }}
      onWheel={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }}
    >
      <div
        className="bg-black backdrop-blur-2xl border border-white/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onMouseDown={(e) => {
          // Prevent modal content clicks from affecting page scroll
          e.stopPropagation();
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/30 bg-black backdrop-blur-lg">
          <h2 className="text-white font-sf-pro-display text-xl font-bold">
            Input Request Form
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20 bg-black backdrop-blur-sm">
          <button
            onClick={() => setActiveTab("events")}
            className={`flex-1 py-4 px-6 font-sf-pro text-sm font-medium transition-all duration-300 ${
              activeTab === "events"
                ? "text-white bg-gray-900 backdrop-blur-md border-b-2 border-white/50"
                : "text-white/70 hover:text-white hover:bg-gray-800"
            }`}
          >
            Events
          </button>
          <button
            onClick={() => setActiveTab("funding")}
            className={`flex-1 py-4 px-6 font-sf-pro text-sm font-medium transition-all duration-300 ${
              activeTab === "funding"
                ? "text-white bg-gray-900 backdrop-blur-md border-b-2 border-white/50"
                : "text-white/70 hover:text-white hover:bg-gray-800"
            }`}
          >
            Funding
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-black backdrop-blur-sm">
          <div className="mb-4">
            <label className="block text-white font-sf-pro text-sm font-medium mb-2">
              {activeTab === "events" ? "Event Request" : "Funding Request"}
            </label>
            <div className="text-white/70 font-sf-pro text-xs mb-3">
              {activeTab === "events"
                ? "Describe your event details, requirements, and expected outcomes."
                : "Describe your funding proposal, amount needed, and how funds will be used."}
            </div>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={handleInputChange}
              placeholder={`Type your ${activeTab} request to Azura Model Daemon...`}
              className="w-full h-48 bg-gray-900 backdrop-blur-md border border-white/30 rounded-2xl p-4 text-white font-cartograph text-sm resize-none focus:border-white/50 focus:bg-gray-800 focus:outline-none placeholder-white/50 transition-all duration-300"
              disabled={isSaving}
              autoFocus={false}
            />

            {/* Terminal cursor effect */}
            <div className="absolute bottom-4 right-4 text-white/50 font-cartograph text-xs">
              {">"} Type here...
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-white/30 bg-black backdrop-blur-md text-white font-sf-pro text-sm font-medium rounded-2xl hover:bg-gray-900 hover:border-white/50 transition-all duration-300"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="flex-1 py-3 px-6 bg-gray-800 backdrop-blur-xl border border-white/30 text-white font-sf-pro text-sm font-medium rounded-2xl hover:bg-gray-700 hover:border-white/50 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Request"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
