import React, { useState, useEffect } from "react";
import { SoundEffects } from "@/lib/soundEffects";

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
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // handling input data 
const handleSave = async () => {
  if (!content.trim()) return;

  setIsSaving(true);
  SoundEffects.playGenerateSound();

  // Default to "events" type since we removed the tab selection
  // Users can specify in their content whether it's for events or funding
  onSave({ type: "events", content: content.trim() });
  
  setContent("");
  onClose();
  setIsSaving(false);
};


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    SoundEffects.playTypingSound();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-black backdrop-blur-2xl border border-white/20 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 bg-black backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
              <img
                src="https://i.imgur.com/nPd20Bd.png"
                alt="Azura Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-white font-sans text-xl font-bold">
              Daemon Proposal
            </h2>
          </div>
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


        {/* Content */}
        <div className="p-6 bg-black backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-white font-sans text-lg font-bold mb-3">
              Daemon Model Proposals
            </h3>
            <div className="text-white/80 font-sans text-sm leading-relaxed">
              Submit your proposal to Azura's decision-making AI for community events or funding requests. 
              Describe your project details, requirements, expected outcomes, and community impact. 
              Include specific information such as venue, dates, budget breakdown, and how it benefits the Academy community.
            </div>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={handleInputChange}
              placeholder="Describe your proposal details, requirements, expected outcomes, and community impact..."
              className="w-full h-48 bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-4 text-white font-cartograph text-base resize-none focus:border-white/40 focus:bg-white/10 focus:outline-none placeholder-white/50 transition-all duration-300"
              disabled={isSaving}
              autoFocus={false}
              style={{ fontSize: '16px' }}
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
              className="flex-1 py-3 px-6 border border-white/20 bg-black backdrop-blur-md text-white font-sans text-sm font-medium rounded-lg hover:bg-white/5 hover:border-white/40 transition-all duration-300"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="flex-1 py-3 px-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white font-sans text-sm font-medium rounded-lg hover:bg-white/20 hover:border-white/40 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
