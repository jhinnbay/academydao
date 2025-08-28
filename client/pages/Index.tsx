import React, { useState, useEffect } from 'react';
import { SoundEffects } from '@/lib/soundEffects';
import { TypewriterDots } from '@/components/TypewriterDots';
import { WalletConnect } from '@/components/WalletConnect';
import { InputRequestModal } from '@/components/InputRequestModal';

export default function Index() {
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showResponse, setShowResponse] = useState(true);
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedRequest, setSavedRequest] = useState<{ type: 'funding' | 'events'; content: string } | null>(null);

  const daemonResponse = "Based on your proposal and the rationale provided (points a, c, v), the current vote of 234,234 tokens represents 34% of the total. As a 40% approval threshold is required to release the funds, this proposal does not currently meet the requirement for execution. I recommend you consult another team member to strategize on securing additional support.";

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsTyping(false);
    setDisplayedResponse('');
    setShowResponse(true);

    // Play generation sound
    SoundEffects.playGenerateSound();

    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setIsTyping(true);

      // Type out the response with sound effects
      SoundEffects.typeWithSound(
        daemonResponse,
        (char, isComplete) => {
          if (!isComplete) {
            setDisplayedResponse(prev => prev + char);
          } else {
            setIsTyping(false);
          }
        },
        30 // typing speed
      );
    }, 1500);
  };

  // Initialize with the response already displayed
  useEffect(() => {
    setDisplayedResponse(daemonResponse);
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveRequest = (data: { type: 'funding' | 'events'; content: string }) => {
    setSavedRequest(data);
    SoundEffects.playCompleteSound();
  };

  return (
    <div className="min-h-screen bg-azura-black text-azura-white font-cartograph">
      <div className="max-w-md mx-auto min-h-screen relative sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl">
        {/* Corner decorations */}
        <div className="absolute top-24 left-4 w-6 h-6 sm:left-6 md:left-8 lg:left-12">
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M23 0H1V3H23V0Z" fill="#D9D9D9"/>
            <path d="M3 23V0L0 3.57741e-08V23H3Z" fill="#D9D9D9"/>
          </svg>
        </div>
        <div className="absolute top-24 right-4 w-6 h-6 sm:right-6 md:right-8 lg:right-12">
          <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0H22V3H0V0Z" fill="#D9D9D9"/>
            <path d="M20 23V0L23 3.57741e-08V23H20Z" fill="#D9D9D9"/>
          </svg>
        </div>

        <div className="pt-24 px-4 pb-4 sm:px-6 md:px-8 lg:px-12">
          {/* Terminal Header Section */}
          <div className="border border-azura-gray-border bg-azura-black mb-4">
            <div className="p-5 pb-0">
              <div className="text-azura-white font-cartograph text-base leading-[140.628%] mb-2.5">
                {'>'} AZURA MODEL DAEMON
              </div>
              <div className="text-azura-text-muted font-cartograph text-base leading-[140.628%] mb-10">
                <span className="text-azura-white">{'|'} </span>
                Sync account with Angel<TypewriterDots className="text-azura-text-muted" />
              </div>
            </div>

            {/* Username Section */}
            <div className="border-t border-b border-azura-gray-medium px-2.5 py-2.5">
              <div className="text-azura-white font-cartograph text-base leading-[140.628%]">
                {'>'} Username: 0x192FSDF324342<br />
                {'>'} Username: jhinnbay.eth
              </div>
            </div>

            {/* Action Cards Section */}
            <div className="p-4 sm:p-6">
              {/* Sync Account Card */}
              <div className="mb-5">
                <div className="flex items-center justify-between h-24 px-6 border-2 border-azura-gray-light rounded-xl bg-azura-black sm:h-28 md:h-32 hover:border-azura-accent-blue hover:bg-azura-black/80 transition-all duration-300 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M12 22V12" stroke="white" strokeWidth="2"/>
                        <path d="M2 7l10 5 10-5" stroke="white" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-azura-white font-sf-pro text-sm font-medium leading-[22px]">
                        Sync Account
                      </div>
                      <div className="text-azura-text-muted-dark font-sf-pro text-sm font-medium leading-[22px]">
                        Can use another device
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2.5">
                    <WalletConnect />
                  </div>
                </div>
              </div>

              {/* Input Request Form Card */}
              <div className="mb-5">
                <div
                  onClick={handleOpenModal}
                  className="flex items-center justify-between h-24 px-6 border-2 border-azura-gray-light rounded-xl bg-azura-black/25 sm:h-28 md:h-32 hover:border-azura-accent-blue hover:bg-azura-black/40 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      savedRequest ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {savedRequest ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                          <polyline points="14,2 14,8 20,8" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
                          <line x1="16" y1="13" x2="8" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <line x1="16" y1="17" x2="8" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          <polyline points="10,9 9,9 8,9" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-azura-white font-sf-pro text-sm font-medium leading-[22px]">
                        Input Request Form
                      </div>
                      <div className="text-azura-text-muted-dark font-sf-pro text-sm font-medium leading-[22px]">
                        {savedRequest ? `${savedRequest.type.charAt(0).toUpperCase() + savedRequest.type.slice(1)} Request` : '0xc12c...484F2'}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2.5">
                    <div className={`font-sf-pro text-sm font-medium leading-[22px] group-hover:text-white transition-colors duration-300 ${
                      savedRequest ? 'text-green-400' : 'text-azura-accent-blue'
                    }`}>
                      {savedRequest ? 'Saved' : 'Open'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isTyping}
                className="w-full h-14 px-16 py-4 border border-azura-light-gray bg-azura-light-gray rounded text-azura-black font-sf-pro-display text-lg sm:text-xl font-semibold leading-[140.628%] hover:bg-azura-light-gray/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed sm:h-16 md:h-18"
              >
                {isGenerating ? 'Generating...' : isTyping ? 'Processing...' : 'Generate 0.008 ETH'}
              </button>
            </div>
          </div>

          {/* Daemon Response Section */}
          <div className="border border-azura-gray-border bg-cover bg-center bg-azura-black min-h-[400px] p-6 sm:p-8 md:p-10 lg:p-12 sm:min-h-[500px] md:min-h-[600px]">
            <div className="text-center">
              <h2 className="text-azura-white font-sf-pro-display text-base font-bold leading-[140.628%] mb-5">
                Daemon Response
              </h2>
              
              {showResponse && (
                <div className="border border-dashed border-azura-white p-5 mb-5">
                  <div className="bg-azura-black p-4 text-azura-text-muted font-cartograph text-sm leading-[140.628%] text-left">
                    {isGenerating ? (
                      <div className="flex items-center">
                        <span className="animate-pulse">Generating response...</span>
                        <span className="ml-2 w-2 h-5 bg-azura-white animate-pulse"></span>
                      </div>
                    ) : (
                      <div>
                        {displayedResponse}
                        {isTyping && <span className="w-2 h-5 bg-azura-white animate-pulse inline-block ml-1"></span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Terminal-style Action Buttons */}
              <div className="border border-azura-gray-border bg-azura-black p-3">
                <div className="text-azura-white font-cartograph text-sm leading-[140.628%] space-y-1">
                  <button className="block w-full text-left hover:text-azura-accent-blue transition-colors">
                    {'>'} DECISION
                  </button>
                  <button className="block w-full text-left hover:text-azura-accent-blue transition-colors">
                    {'>'} VIEW PROP
                  </button>
                  <button className="block w-full text-left hover:text-azura-accent-blue transition-colors">
                    {'>'} SHARE PROP
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input Request Modal */}
        <InputRequestModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRequest}
        />
      </div>
    </div>
  );
}
