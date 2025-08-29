import React, { useState, useEffect } from "react";
import { SoundEffects } from "@/lib/soundEffects";
import { TypewriterDots } from "@/components/TypewriterDots";
import { FallbackWalletConnect } from "@/components/FallbackWalletConnect";
import { InputRequestModal } from "@/components/InputRequestModal";

export default function Index() {
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showResponse, setShowResponse] = useState(true);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedRequest, setSavedRequest] = useState<{
    type: "funding" | "events";
    content: string;
  } | null>(null);

  // Wallet connection states
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [hasAcademicAngel, setHasAcademicAngel] = useState<boolean | null>(
    null,
  );
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isTypingConnection, setIsTypingConnection] = useState(false);

  const daemonResponse =
    "Based on your proposal and the rationale provided (points a, c, v), the current vote of 234,234 tokens represents 34% of the total. As a 40% approval threshold is required to release the funds, this proposal does not currently meet the requirement for execution. I recommend you consult another team member to strategize on securing additional support.";

  const handleGenerate = () => {
    setIsGenerating(true);
    setIsTyping(false);
    setDisplayedResponse("");
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
            setDisplayedResponse((prev) => prev + char);
          } else {
            setIsTyping(false);
          }
        },
        30, // typing speed
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

  const handleSaveRequest = (data: {
    type: "funding" | "events";
    content: string;
  }) => {
    setSavedRequest(data);
    SoundEffects.playCompleteSound();
  };

  const handleWalletConnectionChange = (
    isConnected: boolean,
    address?: string,
    hasToken?: boolean,
  ) => {
    setIsWalletConnected(isConnected);
    setWalletAddress(address || "");

    if (isConnected && address) {
      if (hasToken !== undefined) {
        setHasAcademicAngel(hasToken);

        // Start typing animation for connection message
        setIsTypingConnection(true);
        setConnectionMessage("");

        const message = hasToken
          ? "😇 Congratulations, you made it. Prompt Azura your next request."
          : "❌ Find a real Academic Angel.";

        // Type out the message with sound effects
        SoundEffects.typeWithSound(
          message,
          (char, isComplete) => {
            if (!isComplete) {
              setConnectionMessage((prev) => prev + char);
            } else {
              setIsTypingConnection(false);
            }
          },
          hasToken ? 40 : 60, // Slower typing for success message
        );
      } else {
        // Show loading state while checking tokens
        setIsTypingConnection(true);
        setConnectionMessage("");
        setHasAcademicAngel(null);

        SoundEffects.typeWithSound(
          "Checking Academic Angel credentials...",
          (char, isComplete) => {
            if (!isComplete) {
              setConnectionMessage((prev) => prev + char);
            } else {
              setIsTypingConnection(false);
            }
          },
          30,
        );
      }
    } else if (!isConnected) {
      setHasAcademicAngel(null);
      setConnectionMessage("");
      setIsTypingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-cartograph relative">
      {/* Grainy texture background */}
      <div
        className="absolute inset-0 opacity-50 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2Fd4a87124b9ed45468d4be9ac29f49116?format=webp&width=800')`
        }}
      ></div>
      <div className="max-w-md mx-auto min-h-screen relative sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl z-10">
        {/* Corner decorations - made subtle for glassmorphism */}
        <div className="absolute top-24 left-4 w-6 h-6 sm:left-6 md:left-8 lg:left-12 opacity-20">
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M23 0H1V3H23V0Z" fill="rgba(255,255,255,0.3)" />
            <path
              d="M3 23V0L0 3.57741e-08V23H3Z"
              fill="rgba(255,255,255,0.3)"
            />
          </svg>
        </div>
        <div className="absolute top-24 right-4 w-6 h-6 sm:right-6 md:right-8 lg:right-12 opacity-20">
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0H22V3H0V0Z" fill="rgba(255,255,255,0.3)" />
            <path
              d="M20 23V0L23 3.57741e-08V23H20Z"
              fill="rgba(255,255,255,0.3)"
            />
          </svg>
        </div>

        <div className="pt-24 px-4 pb-4 sm:px-6 md:px-8 lg:px-12">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center border-b-2 border-white/20 pb-8 mb-8 gap-8">
            <div className="flex flex-col items-start gap-6 flex-1 max-w-4xl">
              <h1 className="text-white font-sf-pro-display font-extrabold leading-[140.628%] tracking-wider" style={{fontSize: '36px'}}>
                Hello! I'm Azura... Running Decision-Matrix Analysis.
              </h1>
              <p className="text-white font-sf-pro-display font-normal leading-[140.628%] tracking-wide" style={{fontSize: '24px'}}>
                Welcome to the Mental Wealth Academy simulation core! Let's initiate your first governance protocol. Your Move—draft a proposal through my interface. I'll run neural coherence diagnostics and, if it resonates with our institutional frequency, add alignment tokens. Ready to architect reality?
              </p>
              <button className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-cyan-400/10 to-cyan-400/10 bg-black hover:bg-gray-900 transition-colors duration-300" style={{paddingTop: '8px', paddingBottom: '8px', paddingLeft: '12px', paddingRight: '12px'}}>
                <span className="text-white font-sf-pro-display font-medium" style={{fontSize: '16px'}}>
                  Let's Begin
                </span>
              </button>
            </div>
            <div className="flex justify-center items-end flex-shrink-0">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/e3f7f6cc6250b9b9fd8f122c0daa6cb32f09b1eb?width=970"
                alt="Azura AI Avatar"
                className="w-72 h-72 sm:w-96 sm:h-96 lg:w-[485px] lg:h-[485px] object-cover"
              />
            </div>
          </div>

          {/* Header Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-8 gap-4">
            <div className="flex items-center gap-6">
              <svg width="24" height="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.5L15.09 8.76L22 9.77L17 14.64L18.18 21.52L12 18.27L5.82 21.52L7 14.64L2 9.77L8.91 8.76L12 2.5Z" stroke="#ECECEC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white font-sf-pro-display font-medium" style={{fontSize: '16px'}}>
                DAIMON / Proposals
              </span>
            </div>
            <div className="flex flex-wrap gap-6 sm:gap-8">
              <div className="flex flex-col items-end gap-1">
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>Proposals Created</span>
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>003</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>Angels Inventory</span>
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>008</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>Daemon Model</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-white font-cartograph" style={{fontSize: '16px'}}>Online</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>USED TOKENS</span>
                <span className="text-white font-cartograph" style={{fontSize: '16px'}}>234/34.000</span>
              </div>
            </div>
          </div>

          {/* Terminal Header Section */}
          <div className="border border-white/20 bg-white/10 backdrop-blur-md mb-4 shadow-2xl rounded-2xl animate-float">
            <div className="p-5 pb-0">
              <div className="text-white font-cartograph text-base leading-[140.628%] mb-2.5 font-bold drop-shadow-lg">
                {">"} AZURA MODEL DAEMON
              </div>
              <div className="text-white/80 font-cartograph text-base leading-[140.628%] mb-2.5">
                <span className="text-white">{"|"} </span>
                Sync account with Angel
                <TypewriterDots className="text-white/80" />
              </div>

              {/* Connection Status Message */}
              {isWalletConnected &&
                (connectionMessage || isTypingConnection) && (
                  <div
                    className={`font-cartograph text-base leading-[140.628%] mb-10 ${
                      hasAcademicAngel === true
                        ? "text-green-300"
                        : hasAcademicAngel === false
                          ? "text-red-300"
                          : "text-white/80"
                    }`}
                  >
                    <span className="text-white">{"|"} </span>
                    {connectionMessage}
                    {isTypingConnection && (
                      <span className="w-2 h-5 bg-white animate-pulse inline-block ml-1"></span>
                    )}
                  </div>
                )}

              {/* Default spacing when no connection message */}
              {!(
                isWalletConnected &&
                (connectionMessage || isTypingConnection)
              ) && <div className="mb-8"></div>}
            </div>

            {/* Username Section */}
            <div className="border-t border-b border-white/30 px-2.5 bg-white/5 backdrop-blur-sm" style={{height: '250px'}}>
              <div className="text-white/90 font-cartograph text-base leading-[140.628%] drop-shadow-md flex items-center h-full">
                {">"} Username: jhinnbay.eth
              </div>
            </div>

            {/* Action Cards Section */}
            <div className="p-4 sm:p-6">
              {/* Sync Account Card */}
              <div className="mb-5">
                <div className="flex items-center justify-between h-24 px-6 border border-white/30 rounded-2xl bg-white/15 backdrop-blur-lg sm:h-28 md:h-32 hover:border-white/50 hover:bg-white/25 hover:shadow-xl transition-all duration-500 cursor-pointer group shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-600 to-gray-800 flex items-center justify-center">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L2 7v10l10 5 10-5V7l-10-5z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinejoin="round"
                        />
                        <path d="M12 22V12" stroke="white" strokeWidth="2" />
                        <path
                          d="M2 7l10 5 10-5"
                          stroke="white"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-white font-sf-pro text-sm font-medium leading-[22px] drop-shadow-md">
                        Sync Account
                      </div>
                      <div className="text-white/70 font-sf-pro text-sm font-medium leading-[22px]">
                        Can use another device
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2.5">
                    <FallbackWalletConnect
                      onConnectionChange={handleWalletConnectionChange}
                    />
                  </div>
                </div>
              </div>

              {/* Input Request Form Card */}
              <div className="mb-5">
                <div
                  onClick={handleOpenModal}
                  className="flex items-center justify-between h-24 px-6 border border-white/30 rounded-2xl bg-white/10 backdrop-blur-lg sm:h-28 md:h-32 hover:border-white/50 hover:bg-white/20 hover:shadow-xl transition-all duration-500 cursor-pointer group shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        savedRequest
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : "bg-gradient-to-r from-gray-600 to-gray-800"
                      }`}
                    >
                      {savedRequest ? (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M20 6L9 17l-5-5"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <polyline
                            points="14,2 14,8 20,8"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinejoin="round"
                          />
                          <line
                            x1="16"
                            y1="13"
                            x2="8"
                            y2="13"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <line
                            x1="16"
                            y1="17"
                            x2="8"
                            y2="17"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <polyline
                            points="10,9 9,9 8,9"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <div className="text-white font-sf-pro text-sm font-medium leading-[22px] drop-shadow-md">
                        Input Request Form
                      </div>
                      <div className="text-white/70 font-sf-pro text-sm font-medium leading-[22px]">
                        {savedRequest
                          ? `${savedRequest.type.charAt(0).toUpperCase() + savedRequest.type.slice(1)} Request`
                          : "0xc12c...484F2"}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2.5">
                    <div
                      className={`font-sf-pro text-sm font-medium leading-[22px] transition-colors duration-300 drop-shadow-md ${
                        savedRequest
                          ? "text-green-300 group-hover:text-green-200"
                          : "text-white/80 group-hover:text-white"
                      }`}
                    >
                      {savedRequest ? "Saved" : "Open"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || isTyping}
                className="w-full h-14 px-16 py-4 bg-gradient-to-r from-gray-800/50 via-gray-700/30 to-gray-800/50 backdrop-blur-xl border border-white/30 rounded-2xl text-white font-sf-pro-display text-lg sm:text-xl font-semibold leading-[140.628%] hover:from-gray-700/60 hover:via-gray-600/40 hover:to-gray-700/60 hover:border-white/50 hover:shadow-2xl transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed sm:h-16 md:h-18 shadow-2xl"
              >
                {isGenerating
                  ? "Generating..."
                  : isTyping
                    ? "Processing..."
                    : "Generate 0.008 ETH"}
              </button>
            </div>
          </div>

          {/* Daemon Response Section */}
          <div className="border border-white/20 bg-white/10 backdrop-blur-md min-h-[400px] p-6 sm:p-8 md:p-10 lg:p-12 sm:min-h-[500px] md:min-h-[600px] shadow-2xl rounded-3xl animate-float">
            <div className="text-center">
              <h2 className="text-white font-sf-pro-display text-base font-bold leading-[140.628%] mb-5 drop-shadow-lg">
                Daemon Response
              </h2>

              {showResponse && (
                <div className="border border-dashed border-white/40 p-5 mb-5 bg-white/5 backdrop-blur-sm rounded-2xl">
                  <div className="bg-white/10 backdrop-blur-md p-4 text-white font-cartograph text-sm leading-[140.628%] text-left rounded-xl border border-white/20 shadow-lg">
                    {isGenerating ? (
                      <div className="flex items-center">
                        <span className="animate-pulse">
                          Generating response...
                        </span>
                        <span className="ml-2 w-2 h-5 bg-azura-white animate-pulse"></span>
                      </div>
                    ) : (
                      <div>
                        {displayedResponse}
                        {isTyping && (
                          <span className="w-2 h-5 bg-white animate-pulse inline-block ml-1"></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terminal-style Action Buttons */}
              <div className="border border-white/30 bg-white/10 backdrop-blur-lg p-3 rounded-2xl shadow-2xl">
                <div className="text-white font-cartograph text-sm leading-[140.628%] space-y-1">
                  <button className="block w-full text-left hover:text-white hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300">
                    {">"} DECISION
                  </button>
                  <button className="block w-full text-left hover:text-white hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300">
                    {">"} VIEW PROP
                  </button>
                  <button className="block w-full text-left hover:text-white hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300">
                    {">"} SHARE PROP
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
