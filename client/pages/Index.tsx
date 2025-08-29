import React, { useState, useEffect } from "react";
import { SoundEffects } from "@/lib/soundEffects";
import { TypewriterDots } from "@/components/TypewriterDots";
import { WalletConnect } from "@/components/WalletConnect";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(3);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState<{
    [key: string]: { top?: boolean; left?: boolean };
  }>({});

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isMobileMenuOpen && !target.closest("nav")) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Only capture scroll position when needed, don't interfere with normal scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!isGenerating && !isTyping) {
        setScrollPosition(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isGenerating, isTyping]);

  // Calculate tooltip position based on viewport bounds
  const calculateTooltipPosition = (
    element: HTMLElement,
    tooltipKey: string,
  ) => {
    const rect = element.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = tooltipKey === "angels" ? 288 : 256; // w-72 = 288px, w-64 = 256px
    const tooltipHeight = 120; // Approximate height
    const margin = 8; // Minimum margin from viewport edges

    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceTop = rect.top;
    const spaceBottom = viewportHeight - rect.bottom;

    // Determine vertical position (above or below)
    let showAbove = spaceTop > tooltipHeight + margin;
    if (!showAbove && spaceBottom < tooltipHeight + margin) {
      // If neither position fits well, choose the one with more space
      showAbove = spaceTop > spaceBottom;
    }

    // Determine horizontal alignment
    let alignLeft = false;
    let alignCenter = false;

    // Try to center the tooltip under the element first
    const elementCenter = rect.left + rect.width / 2;
    const tooltipLeft = elementCenter - tooltipWidth / 2;
    const tooltipRight = tooltipLeft + tooltipWidth;

    if (tooltipLeft >= margin && tooltipRight <= viewportWidth - margin) {
      // Center alignment works
      alignCenter = true;
    } else if (rect.right + tooltipWidth <= viewportWidth - margin) {
      // Right alignment (tooltip starts at element's right edge)
      alignLeft = false;
    } else if (rect.left - tooltipWidth >= margin) {
      // Left alignment (tooltip ends at element's left edge)
      alignLeft = true;
    } else {
      // Force fit by aligning to the side with more space
      alignLeft = spaceLeft > spaceRight;
    }

    const position = {
      top: !showAbove, // true = below, false = above
      left: alignLeft,
      center: alignCenter,
    };

    setTooltipPosition((prev) => ({ ...prev, [tooltipKey]: position }));
  };

  const handleTooltipShow = (tooltipKey: string, event: React.MouseEvent) => {
    const element = event.currentTarget as HTMLElement;
    calculateTooltipPosition(element, tooltipKey);
    setTooltipVisible(tooltipKey);
  };

  // Handle window resize to reposition tooltips
  useEffect(() => {
    const handleResize = () => {
      if (tooltipVisible) {
        // Small delay to ensure DOM has updated after resize
        setTimeout(() => {
          const element = document.querySelector(
            `[data-tooltip="${tooltipVisible}"]`,
          ) as HTMLElement;
          if (element) {
            calculateTooltipPosition(element, tooltipVisible);
          }
        }, 10);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tooltipVisible]);

  // Minimal browser scroll restoration management
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    return () => {
      if ("scrollRestoration" in history) {
        history.scrollRestoration = "auto";
      }
    };
  }, []);

  const daemonResponse =
    "Based on your proposal and the rationale provided (points a, c, v), the current vote of 234,234 tokens represents 34% of the total. As a 40% approval threshold is required to release the funds, this proposal does not currently meet the requirement for execution. I recommend you consult another team member to strategize on securing additional support.";

  const handleGenerate = () => {
    // Batch state updates to prevent multiple renders
    React.startTransition(() => {
      setRequestCount((prev) => prev + 1);
      setIsGenerating(true);
      setIsTyping(false);
      setDisplayedResponse("");
      setShowResponse(true);
    });

    // Play generation sound
    SoundEffects.playGenerateSound();

    // Simulate generation delay
    setTimeout(() => {
      React.startTransition(() => {
        setIsGenerating(false);
        setIsTyping(true);
      });

      // Type out the response with sound effects
      SoundEffects.typeWithSound(
        daemonResponse,
        (char, isComplete) => {
          if (!isComplete) {
            setDisplayedResponse((prev) => prev + char);
          } else {
            React.startTransition(() => {
              setIsTyping(false);
            });
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
        className="absolute inset-0 opacity-30 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2Fd4a87124b9ed45468d4be9ac29f49116?format=webp&width=800')`,
          filter:
            "grayscale(100%) brightness(0.05) contrast(3) saturate(0%) hue-rotate(0deg)",
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

        {/* Futuristic Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F907173652fac434888a7b68f5b83718e?format=webp&width=800"
                  alt="Mental Wealth Academy"
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <span
                  className="font-sans font-bold text-white"
                  style={{
                    fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                    fontWeight: "700",
                  }}
                >
                  Mental Wealth Academy
                </span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                <button
                  onClick={(e) => {
                    e.preventDefault(); /* Add smooth scroll logic here if needed */
                  }}
                  className="font-sans text-white/80 hover:text-white transition-colors duration-300"
                  style={{
                    fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                    fontWeight: "500",
                  }}
                >
                  Research
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault(); /* Add smooth scroll logic here if needed */
                  }}
                  className="font-sans text-white/80 hover:text-white transition-colors duration-300"
                  style={{
                    fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                    fontWeight: "500",
                  }}
                >
                  Angels
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault(); /* Add smooth scroll logic here if needed */
                  }}
                  className="font-sans text-white/80 hover:text-white transition-colors duration-300"
                  style={{
                    fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                    fontWeight: "500",
                  }}
                >
                  Facility
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault(); /* Add smooth scroll logic here if needed */
                  }}
                  className="font-sans text-white/80 hover:text-white transition-colors duration-300"
                  style={{
                    fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                    fontWeight: "500",
                  }}
                >
                  Events
                </button>
              </div>

              {/* Search Bar and User Profile */}
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="hidden sm:flex items-center relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors duration-300"
                    style={{
                      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                      width: "200px",
                    }}
                  />
                  <svg
                    className="absolute right-3 w-4 h-4 text-white/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* User Profile */}
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 hover:border-white/40 transition-colors duration-300">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span
                    className="hidden sm:block font-sans text-white/90"
                    style={{
                      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                      fontWeight: "500",
                    }}
                  >
                    jhinnbay.eth
                  </span>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/40 transition-colors duration-300"
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="md:hidden border-t border-white/10 bg-black/90 backdrop-blur-xl">
                <div className="px-4 py-4 space-y-3">
                  <button
                    className="block w-full text-left font-sans text-white/80 hover:text-white transition-colors duration-300 py-2"
                    style={{
                      fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                      fontWeight: "500",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Research
                  </button>
                  <button
                    className="block w-full text-left font-sans text-white/80 hover:text-white transition-colors duration-300 py-2"
                    style={{
                      fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                      fontWeight: "500",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Angels
                  </button>
                  <button
                    className="block w-full text-left font-sans text-white/80 hover:text-white transition-colors duration-300 py-2"
                    style={{
                      fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                      fontWeight: "500",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Facility
                  </button>
                  <button
                    className="block w-full text-left font-sans text-white/80 hover:text-white transition-colors duration-300 py-2"
                    style={{
                      fontSize: "clamp(0.875rem, 1.2vw, 1rem)",
                      fontWeight: "500",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Events
                  </button>

                  {/* Mobile Search */}
                  <div className="pt-3 border-t border-white/10">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/40 transition-colors duration-300"
                        style={{
                          fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                        }}
                      />
                      <svg
                        className="absolute right-3 top-2.5 w-4 h-4 text-white/50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        <div className="pt-24 px-4 pb-4 sm:px-6 md:px-8 lg:px-12">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row justify-between items-center border-b-2 border-white/20 mb-8 gap-8">
            <div className="flex flex-col items-start gap-6 flex-1 max-w-4xl">
              <h1
                className="font-sans font-bold bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent"
                style={{
                  fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                  fontWeight: "700",
                  fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
                }}
              >
                Align Your Academic Path
              </h1>
              <p
                className="font-sans"
                style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                  lineHeight: "1.6",
                  fontWeight: "400",
                  color: "#b0b0b0",
                }}
              >
                Request a meeting with our team to get initiated. I'm Azura,
                your optimized decision-making model matrix funding and
                collaboration assistant. Setup the perfect team meeting or aide
                for your next breakthrough, I'll analyze and connect you with
                the right resources.
              </p>
              <div className="flex flex-col items-start gap-2">
                <WalletConnect
                  onConnectionChange={handleWalletConnectionChange}
                />
                {isWalletConnected && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span
                      className="font-sans text-green-300"
                      style={{
                        fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                        fontWeight: "500",
                      }}
                    >
                      Wallet Connected
                    </span>
                  </div>
                )}
              </div>
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2.5L15.09 8.76L22 9.77L17 14.64L18.18 21.52L12 18.27L5.82 21.52L7 14.64L2 9.77L8.91 8.76L12 2.5Z"
                  stroke="#ECECEC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="font-sans"
                style={{
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                  lineHeight: "1.6",
                  fontWeight: "500",
                  color: "#ffffff",
                }}
              >
                Academy Initiation Tests
              </span>
            </div>
            <div className="flex flex-wrap gap-6 sm:gap-8">
              {/* Requests with Tooltip */}
              <div
                className="flex flex-col items-end gap-1 relative cursor-help"
                data-tooltip="requests"
                onMouseEnter={(e) => handleTooltipShow("requests", e)}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                <span
                  className="font-cartograph"
                  style={{
                    fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                    fontWeight: "400",
                    color: "#888888",
                  }}
                >
                  Requests
                </span>
                <span
                  className="font-cartograph"
                  style={{
                    fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                    fontWeight: "400",
                    color: "#ffffff",
                  }}
                >
                  {requestCount.toString().padStart(3, "0")}
                </span>
                {tooltipVisible === "requests" && (
                  <div
                    className={`absolute ${tooltipPosition.requests?.top === false ? "top-full mt-2" : "bottom-full mb-2"} ${tooltipPosition.requests?.left ? "left-0" : "right-0"} w-64 max-w-[90vw] p-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-sans z-50`}
                  >
                    <div className="font-medium mb-1">Request Counter</div>
                    <div className="text-white/80">
                      Track how many requests have been made. This counter
                      increments when you click the Generate button.
                    </div>
                    <div
                      className={`absolute ${tooltipPosition.requests?.top === false ? "bottom-full" : "top-full"} ${tooltipPosition.requests?.left ? "left-4" : "right-4"} w-0 h-0 border-l-4 border-r-4 ${tooltipPosition.requests?.top === false ? "border-b-4 border-b-white/20" : "border-t-4 border-t-white/20"} border-transparent`}
                    ></div>
                  </div>
                )}
              </div>

              {/* Angels with Tooltip */}
              <div
                className="flex flex-col items-end gap-1 relative cursor-help"
                data-tooltip="angels"
                onMouseEnter={(e) => handleTooltipShow("angels", e)}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                <span
                  className="font-cartograph"
                  style={{
                    fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                    fontWeight: "400",
                    color: "#888888",
                  }}
                >
                  Angels
                </span>
                <span
                  className="font-cartograph"
                  style={{
                    fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                    fontWeight: "400",
                    color: "#ffffff",
                  }}
                >
                  008
                </span>
                {tooltipVisible === "angels" && (
                  <div
                    className={`absolute ${tooltipPosition.angels?.top === false ? "top-full mt-2" : "bottom-full mb-2"} ${tooltipPosition.angels?.left ? "left-0" : "right-0"} w-72 max-w-[90vw] p-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-sans z-50`}
                  >
                    <div className="font-medium mb-1">Angels</div>
                    <div className="text-white/80">
                      Angels are senior members who review and support your
                      proposals. Gain their backing to strengthen your approval
                      chances.
                    </div>
                    <div
                      className={`absolute ${tooltipPosition.angels?.top === false ? "bottom-full" : "top-full"} ${tooltipPosition.angels?.left ? "left-4" : "right-4"} w-0 h-0 border-l-4 border-r-4 ${tooltipPosition.angels?.top === false ? "border-b-4 border-b-white/20" : "border-t-4 border-t-white/20"} border-transparent`}
                    ></div>
                  </div>
                )}
              </div>

              {/* Daemon Model with Tooltip */}
              <div
                className="flex flex-col items-end gap-1 relative cursor-help"
                data-tooltip="daemon"
                onMouseEnter={(e) => handleTooltipShow("daemon", e)}
                onMouseLeave={() => setTooltipVisible(null)}
              >
                <span
                  className="font-cartograph"
                  style={{
                    fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                    fontWeight: "400",
                    color: "#888888",
                  }}
                >
                  Daemon Model
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span
                    className="font-cartograph"
                    style={{
                      fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                      fontWeight: "400",
                      color: "#ffffff",
                    }}
                  >
                    Online
                  </span>
                </div>
                {tooltipVisible === "daemon" && (
                  <div
                    className={`absolute ${tooltipPosition.daemon?.top === false ? "top-full mt-2" : "bottom-full mb-2"} ${tooltipPosition.daemon?.left ? "left-0" : "right-0"} w-64 max-w-[90vw] p-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-sans z-50`}
                  >
                    <div className="font-medium mb-1">Daemon Model</div>
                    <div className="text-white/80">
                      Academy's customer AI Azura - your optimized
                      decision-making assistant for funding and collaboration.
                    </div>
                    <div
                      className={`absolute ${tooltipPosition.daemon?.top === false ? "bottom-full" : "top-full"} ${tooltipPosition.daemon?.left ? "left-4" : "right-4"} w-0 h-0 border-l-4 border-r-4 ${tooltipPosition.daemon?.top === false ? "border-b-4 border-b-white/20" : "border-t-4 border-t-white/20"} border-transparent`}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terminal Header Section */}
          <div className="border border-white/20 bg-white/10 backdrop-blur-md mb-4 shadow-2xl rounded-2xl">
            <div className="p-5 pb-0">
              <div
                className="text-white font-cartograph leading-[140.628%] mb-2.5 font-bold drop-shadow-lg"
                style={{ fontSize: "16px" }}
              >
                {">"} AZURA MODEL DAEMON
              </div>
              <div
                className="font-cartograph mb-2.5"
                style={{
                  fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                  lineHeight: "1.6",
                  fontWeight: "400",
                  color: "#b0b0b0",
                }}
              >
                <span style={{ color: "#ffffff" }}>{"|"} </span>
                Sync account with Angel
                <TypewriterDots className="text-white/80" />
              </div>

              {/* Connection Status Message */}
              {isWalletConnected &&
                (connectionMessage || isTypingConnection) && (
                  <div
                    className={`font-cartograph leading-[140.628%] mb-10 ${
                      hasAcademicAngel === true
                        ? "text-green-300"
                        : hasAcademicAngel === false
                          ? "text-red-300"
                          : "text-white/80"
                    }`}
                    style={{ fontSize: "16px" }}
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

            {/* Username Section - Secondary/Smaller */}
            <div className="border-t border-b border-white/20 px-4 py-3 bg-white/5 backdrop-blur-sm">
              <div
                className="text-white/70 font-cartograph drop-shadow-md"
                style={{
                  fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                  fontWeight: "400",
                }}
              >
                {">"} Username: jhinnbay.eth
              </div>
            </div>

            {/* Main Action Section */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Primary Input Request Form Card - Main Focal Point */}
              <div className="relative">
                <div
                  onClick={handleOpenModal}
                  className="border border-white/20 rounded-2xl bg-gradient-to-br from-white/5 to-black/20 backdrop-blur-xl hover:border-white/30 hover:from-white/10 hover:to-black/10 hover:shadow-2xl hover:shadow-black/20 transition-all duration-500 cursor-pointer group shadow-xl p-6 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      {/* Notebook Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center flex-shrink-0 group-hover:from-white/15 group-hover:to-white/10 transition-all duration-500">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white/80 group-hover:text-white transition-colors duration-500"
                        >
                          <path
                            d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2H6Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                          <polyline
                            points="14,2 14,8 20,8"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                          <line
                            x1="16"
                            y1="13"
                            x2="8"
                            y2="13"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <line
                            x1="16"
                            y1="17"
                            x2="8"
                            y2="17"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <line
                            x1="10"
                            y1="9"
                            x2="8"
                            y2="9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <div
                          className="font-sans font-bold drop-shadow-md mb-2"
                          style={{
                            fontSize: "clamp(1.125rem, 2vw, 1.5rem)",
                            lineHeight: "1.3",
                            fontWeight: "700",
                            color: "#ffffff",
                          }}
                        >
                          Request Form
                        </div>
                        <div
                          className="font-sans"
                          style={{
                            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                            lineHeight: "1.5",
                            fontWeight: "400",
                            color: "#b0b0b0",
                          }}
                        >
                          {savedRequest
                            ? `${savedRequest.type.charAt(0).toUpperCase() + savedRequest.type.slice(1)} Request Saved`
                            : "Create your request"}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-black/30 backdrop-blur-sm border border-white/30">
                      <div
                        className={`font-sans font-semibold transition-colors duration-300 drop-shadow-md ${
                          savedRequest
                            ? "text-green-300 group-hover:text-green-200"
                            : "text-white/80 group-hover:text-white"
                        }`}
                        style={{
                          fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                          lineHeight: "1.4",
                          fontWeight: "600",
                        }}
                      >
                        {savedRequest ? "Edit" : "Open"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button Section */}
              <div className="space-y-4">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || isTyping}
                  className="w-full bg-gradient-to-r from-gray-800/50 via-black/30 to-gray-800/50 backdrop-blur-xl border border-white/30 rounded-2xl font-sans font-semibold hover:from-gray-700/60 hover:via-gray-800/40 hover:to-gray-700/60 hover:border-white/50 hover:shadow-2xl hover:shadow-black/30 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                  style={{
                    fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                    lineHeight: "1.6",
                    fontWeight: "600",
                    color: "#ffffff",
                    paddingTop: "20px",
                    paddingBottom: "20px",
                    paddingLeft: "32px",
                    paddingRight: "32px",
                  }}
                >
                  {isGenerating
                    ? "Funding..."
                    : isTyping
                      ? "Processing..."
                      : "Send Request (0.008 ETH)"}
                </button>
                <div className="text-center">
                  <p
                    className="font-sans text-white/70"
                    style={{
                      fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                      lineHeight: "1.5",
                      fontWeight: "400",
                    }}
                  >
                    This fee powers the review engine and validates your
                    submission on-chain.
                  </p>
                </div>
              </div>

              {/* Angel Guidance Section */}
              <div className="border border-amber-400/30 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-lg p-6 shadow-xl">
                <div className="mb-4">
                  <div>
                    <h3
                      className="font-sans font-bold text-amber-200 mb-2"
                      style={{
                        fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                        lineHeight: "1.3",
                        fontWeight: "700",
                      }}
                    >
                      Strengthen Your Proposal
                    </h3>
                    <div className="space-y-3">
                      {/* Gamification Progress */}
                      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-amber-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="font-sans text-white/90"
                            style={{
                              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                              lineHeight: "1.4",
                              fontWeight: "500",
                            }}
                          >
                            Angels Connected
                          </span>
                          <span
                            className="font-cartograph text-amber-300"
                            style={{
                              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                              fontWeight: "600",
                            }}
                          >
                            0/3
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: "0%" }}
                          ></div>
                        </div>
                        <p
                          className="font-sans text-amber-200/80"
                          style={{
                            fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                            lineHeight: "1.5",
                            fontWeight: "400",
                          }}
                        >
                          Secure at least 1 Angel to boost proposal strength
                        </p>
                      </div>

                      {/* Action Guidance */}
                      <div className="space-y-3">
                        <p
                          className="font-sans text-white/80"
                          style={{
                            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                            lineHeight: "1.5",
                            fontWeight: "400",
                          }}
                        >
                          No Angels yet? Invite to review your request.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            className="flex-1 bg-gradient-to-r from-amber-600/30 to-amber-500/20 backdrop-blur-sm border border-amber-400/40 rounded-xl px-4 py-3 font-sans font-semibold text-amber-200 hover:from-amber-500/40 hover:to-amber-400/30 hover:border-amber-400/60 hover:text-amber-100 transition-all duration-300"
                            style={{
                              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                              lineHeight: "1.4",
                              fontWeight: "600",
                            }}
                          >
                            Invite Angel Reviewer
                          </button>
                          <button
                            className="flex-1 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 font-sans font-medium text-white/80 hover:bg-white/20 hover:border-white/50 hover:text-white transition-all duration-300"
                            style={{
                              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                              lineHeight: "1.4",
                              fontWeight: "500",
                            }}
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daemon Response Section */}
          <div className="border border-white/20 bg-white/10 backdrop-blur-md min-h-[400px] p-6 sm:p-8 md:p-10 lg:p-12 sm:min-h-[500px] md:min-h-[600px] shadow-2xl rounded-3xl">
            <div className="text-center">
              <h2
                className="text-white font-sans font-bold mb-5 drop-shadow-lg"
                style={{
                  fontSize: "24px",
                  lineHeight: "1.1",
                  letterSpacing: "-0.02em",
                }}
              >
                Daemon Response
              </h2>

              {showResponse && (
                <div className="border border-dashed border-white/40 p-5 mb-5 bg-white/5 backdrop-blur-sm rounded-2xl">
                  <div
                    className="bg-white/10 backdrop-blur-md p-4 font-cartograph text-left rounded-xl border border-white/20 shadow-lg"
                    style={{
                      fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                      lineHeight: "1.6",
                      fontWeight: "400",
                      color: "#b0b0b0",
                    }}
                  >
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
                <div
                  className="font-cartograph space-y-1"
                  style={{
                    fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                    lineHeight: "1.6",
                    fontWeight: "400",
                    color: "#b0b0b0",
                  }}
                >
                  <button
                    className="block w-full text-left hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300"
                    style={{ color: "#b0b0b0" }}
                    onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.target.style.color = "#b0b0b0")}
                  >
                    {">"} DECISION
                  </button>
                  <button
                    className="block w-full text-left hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300"
                    style={{ color: "#b0b0b0" }}
                    onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.target.style.color = "#b0b0b0")}
                  >
                    {">"} VIEW PROP
                  </button>
                  <button
                    className="block w-full text-left hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300"
                    style={{ color: "#b0b0b0" }}
                    onMouseEnter={(e) => (e.target.style.color = "#ffffff")}
                    onMouseLeave={(e) => (e.target.style.color = "#b0b0b0")}
                  >
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
