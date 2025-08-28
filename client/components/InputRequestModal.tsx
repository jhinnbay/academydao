import React, { useState } from 'react';
import { SoundEffects } from '@/lib/soundEffects';

interface InputRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: 'funding' | 'events'; content: string }) => void;
}

export const InputRequestModal: React.FC<InputRequestModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<'funding' | 'events'>('funding');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    SoundEffects.playGenerateSound();
    
    // Simulate save delay
    setTimeout(() => {
      onSave({ type: activeTab, content: content.trim() });
      setIsSaving(false);
      setContent('');
      onClose();
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    SoundEffects.playTypingSound();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-float">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-mwa-border-light bg-gradient-to-r from-mwa-primary-blue to-mwa-secondary-blue">
          <h2 className="text-white font-sf-pro-display text-xl font-bold">
            Input Request Form
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-mwa-border-light bg-mwa-soft-gray">
          <button
            onClick={() => setActiveTab('funding')}
            className={`flex-1 py-4 px-6 font-sf-pro text-sm font-medium transition-colors ${
              activeTab === 'funding'
                ? 'text-mwa-primary-blue bg-white border-b-2 border-mwa-primary-blue'
                : 'text-mwa-text-secondary hover:text-mwa-primary-blue'
            }`}
          >
            Funding
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-4 px-6 font-sf-pro text-sm font-medium transition-colors ${
              activeTab === 'events'
                ? 'text-mwa-primary-blue bg-white border-b-2 border-mwa-primary-blue'
                : 'text-mwa-text-secondary hover:text-mwa-primary-blue'
            }`}
          >
            Events
          </button>
        </div>

        {/* Content */}
        <div className="p-6 bg-white">
          <div className="mb-4">
            <label className="block text-mwa-text-primary font-sf-pro text-sm font-medium mb-2">
              {activeTab === 'funding' ? 'Funding Request' : 'Event Request'}
            </label>
            <div className="text-mwa-text-secondary font-sf-pro text-xs mb-3">
              {activeTab === 'funding'
                ? 'Describe your funding proposal, amount needed, and how funds will be used.'
                : 'Describe your event details, requirements, and expected outcomes.'
              }
            </div>
          </div>

          <div className="relative">
            <textarea
              value={content}
              onChange={handleInputChange}
              placeholder={`Type your ${activeTab} request to Azura Model Daemon...`}
              className="w-full h-48 bg-mwa-soft-gray border-2 border-mwa-border-light rounded-lg p-4 text-mwa-text-primary font-cartograph text-sm resize-none focus:border-mwa-primary-blue focus:outline-none placeholder-mwa-text-secondary"
              disabled={isSaving}
            />
            
            {/* Terminal cursor effect */}
            <div className="absolute bottom-4 right-4 text-mwa-text-secondary font-cartograph text-xs">
              {'>'} Type here...
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-mwa-border-light bg-transparent text-mwa-text-primary font-sf-pro text-sm font-medium rounded-lg hover:bg-mwa-soft-gray transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!content.trim() || isSaving}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-mwa-primary-blue to-mwa-secondary-blue text-white font-sf-pro text-sm font-medium rounded-lg hover:from-mwa-secondary-blue hover:to-mwa-accent-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
