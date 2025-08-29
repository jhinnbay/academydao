import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SoundEffects } from "@/lib/soundEffects";
import { TypewriterDots } from "@/components/TypewriterDots";
import { PrivyAuth } from "@/components/PrivyAuth";
import { InputRequestModal } from "@/components/InputRequestModal";
import RetroMusicPlayer from "@/components/RetroMusicPlayer";
import { usePrivy } from "@privy-io/react-auth";
import {
  ScrollPreservation,
  createDebouncedUpdater,
} from "@/lib/scrollPreservation";

export default function Index() {
  const { ready, authenticated, user } = usePrivy();
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showResponse, setShowResponse] = useState(true);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounced updater for typing animation to prevent scroll jumping
  const debouncedSetDisplayedResponse = useMemo(
    () => createDebouncedUpdater(setDisplayedResponse, 16),
    [],
  );
  const [savedRequest, setSavedRequest] = useState<{
    type: "funding" | "events";
    content: string;
  } | null>(null);

  // Wallet connection states
  const [hasAcademicAngel, setHasAcademicAngel] = useState<boolean | null>(
    null,
  );
  const [connectionMessage, setConnectionMessage] = useState("");
  const [isTypingConnection, setIsTypingConnection] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(3);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    [key: string]: { top?: boolean; left?: boolean; center?: boolean };
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

  const handleTooltipShow = useCallback(
    (tooltipKey: string, event: React.MouseEvent) => {
      const element = event.currentTarget as HTMLElement;
      calculateTooltipPosition(element, tooltipKey);
      setTooltipVisible(tooltipKey);
    },
    [],
  );

  // Handle window resize to reposition tooltips (simplified)
  useEffect(() => {
    const handleResize = () => {
      if (tooltipVisible) {
        setTooltipVisible(null); // Just hide tooltip on resize
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [tooltipVisible]);

  const daemonResponse =
    "Based on your proposal and the rationale provided (points a, c, v), the current vote of 234,234 tokens represents 34% of the total. As a 40% approval threshold is required to release the funds, this proposal does not currently meet the requirement for execution. I recommend you consult another team member to strategize on securing additional support.";

  const handleGenerate = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Immediately preserve scroll position before any state changes
      const currentScrollPosition = window.scrollY;

      // Prevent any scroll jumping during state updates
      requestAnimationFrame(() => {
        if (Math.abs(window.scrollY - currentScrollPosition) > 10) {
          window.scrollTo({
            top: currentScrollPosition,
            behavior: "instant",
          });
        }
      });

      // Batch state updates
      setRequestCount((prev) => prev + 1);
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
        let currentText = "";
        SoundEffects.typeWithSound(
          daemonResponse,
          (char, isComplete) => {
            if (!isComplete) {
              currentText += char;
              debouncedSetDisplayedResponse(currentText);
            } else {
              // Ensure final text is displayed immediately
              setDisplayedResponse(daemonResponse);
              setIsTyping(false);
            }
          },
          30, // typing speed
        );
      }, 1500);
    },
    [debouncedSetDisplayedResponse, daemonResponse],
  );

  // Initialize with the response already displayed only on mount if not actively processing
  useEffect(() => {
    if (!isTyping && !isGenerating && showResponse) {
      setDisplayedResponse(daemonResponse);
    }
  }, []);

  // Simple scroll management - only prevent initial jump, allow normal scrolling during typing
  useEffect(() => {
    // Enable auto scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "auto";
    }
  }, []);

  const handleOpenModal = useCallback((e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ScrollPreservation.preserve();
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    ScrollPreservation.restore();
    setIsModalOpen(false);
  }, []);

  const handleSaveRequest = useCallback(
    (data: { type: "funding" | "events"; content: string }) => {
      setSavedRequest(data);
      SoundEffects.playCompleteSound();
    },
    [],
  );

  return (
    <div className="min-h-screen bg-black text-white font-cartograph relative">
      {/* Grainy texture background */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F8e9f72a9d4a246798983ea682efbc588?format=webp&width=800')`,
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
                    e.preventDefault();
                    e.stopPropagation();
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
                    e.preventDefault();
                    e.stopPropagation();
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
                    e.preventDefault();
                    e.stopPropagation();
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
                    e.preventDefault();
                    e.stopPropagation();
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
                    {ready && authenticated && user?.wallet?.address
                      ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                      : "Connect Wallet"}
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
                      e.stopPropagation();
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
                      e.stopPropagation();
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
                      e.stopPropagation();
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
                      e.stopPropagation();
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

        {/* Music Player */}
        <div className="fixed top-16 left-0 right-0 z-40">
          <RetroMusicPlayer />
        </div>

        <div className="pt-52 px-6 pb-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
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
                Welcome To The Academy
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
                I'm Azura. Built to accelerate your vision. Call a team meeting
                — I'll schedule, shape the agenda, and unlock the exact
                resources you need to win. Let's build what's next.
              </p>
              <div className="flex flex-col items-start gap-2">
                <PrivyAuth />
                {ready && authenticated && user?.wallet?.address && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span
                      className="font-sans text-green-300"
                      style={{
                        fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                        fontWeight: "500",
                      }}
                    >
                      Connected{" "}
                      {user?.wallet?.address &&
                        `(${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center items-end flex-shrink-0">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F3188d1a4b66143a3aa0723ddb0dda104"
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
            <div className="flex justify-between items-center w-full">
              {/* Requests with Tooltip */}
              <div
                className="flex flex-col items-start gap-1 relative cursor-help"
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
                    className={`absolute ${tooltipPosition.requests?.top ? "top-full mt-2" : "bottom-full mb-2"} ${
                      tooltipPosition.requests?.center
                        ? "left-1/2 -translate-x-1/2"
                        : tooltipPosition.requests?.left
                          ? "right-full mr-2"
                          : "left-full ml-2"
                    } w-64 max-w-[90vw] p-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-sans z-50`}
                  >
                    <div className="font-medium mb-1">Request Counter</div>
                    <div className="text-white/80">
                      Track how many requests have been made. This counter
                      increments when you click the Generate button.
                    </div>
                    <div
                      className={`absolute ${tooltipPosition.requests?.top ? "bottom-full" : "top-full"} ${
                        tooltipPosition.requests?.center
                          ? "left-1/2 -translate-x-1/2"
                          : tooltipPosition.requests?.left
                            ? "right-4"
                            : "left-4"
                      } w-0 h-0 border-l-4 border-r-4 ${tooltipPosition.requests?.top ? "border-b-4 border-b-white/20" : "border-t-4 border-t-white/20"} border-transparent`}
                    ></div>
                  </div>
                )}
              </div>

              {/* Angels with Tooltip */}
              <div
                className="flex flex-col items-center gap-1 relative cursor-help"
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
                  000
                </span>
                {tooltipVisible === "angels" && (
                  <div
                    className={`absolute ${tooltipPosition.angels?.top ? "top-full mt-2" : "bottom-full mb-2"} ${
                      tooltipPosition.angels?.center
                        ? "left-1/2 -translate-x-1/2"
                        : tooltipPosition.angels?.left
                          ? "right-full mr-2"
                          : "left-full ml-2"
                    } w-72 max-w-[90vw] p-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-sans z-50`}
                  >
                    <div className="font-medium mb-1">Angels</div>
                    <div className="text-white/80">
                      Angels are senior members who review and support your
                      proposals. Gain their backing to strengthen your approval
                      chances.
                    </div>
                    <div
                      className={`absolute ${tooltipPosition.angels?.top ? "bottom-full" : "top-full"} ${
                        tooltipPosition.angels?.center
                          ? "left-1/2 -translate-x-1/2"
                          : tooltipPosition.angels?.left
                            ? "right-4"
                            : "left-4"
                      } w-0 h-0 border-l-4 border-r-4 ${tooltipPosition.angels?.top ? "border-b-4 border-b-white/20" : "border-t-4 border-t-white/20"} border-transparent`}
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
                    className={`absolute ${tooltipPosition.daemon?.top ? "top-full mt-2" : "bottom-full mb-2"} ${
                      tooltipPosition.daemon?.center
                        ? "left-1/2 -translate-x-1/2"
                        : tooltipPosition.daemon?.left
                          ? "right-full mr-2"
                          : "left-full ml-2"
                    } w-64 max-w-[90vw] p-3 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-white text-sm font-sans z-50`}
                  >
                    <div className="font-medium mb-1">Daemon Model</div>
                    <div className="text-white/80">
                      Academy's customer AI Azura - your optimized
                      decision-making assistant for funding and collaboration.
                    </div>
                    <div
                      className={`absolute ${tooltipPosition.daemon?.top ? "bottom-full" : "top-full"} ${
                        tooltipPosition.daemon?.center
                          ? "left-1/2 -translate-x-1/2"
                          : tooltipPosition.daemon?.left
                            ? "right-4"
                            : "left-4"
                      } w-0 h-0 border-l-4 border-r-4 ${tooltipPosition.daemon?.top ? "border-b-4 border-b-white/20" : "border-t-4 border-t-white/20"} border-transparent`}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terminal Header Section */}
          <div className="border border-white/20 bg-black backdrop-blur-md mb-4 shadow-2xl overflow-hidden">
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
              {ready &&
                authenticated &&
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
                ready &&
                authenticated &&
                (connectionMessage || isTypingConnection)
              ) && <div className="mb-8"></div>}
            </div>

            {/* Username Section - Secondary/Smaller */}
            <div className="border-t border-b border-white/20 px-4 py-3 bg-black backdrop-blur-sm">
              <div
                className="text-white/70 font-cartograph drop-shadow-md"
                style={{
                  fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                  fontWeight: "400",
                }}
              >
                {">"} Username:{" "}
                {ready && authenticated && user?.wallet?.address
                  ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
                  : "Not Connected"}
              </div>
            </div>

            {/* Angels Connected Progress */}
            <div className="border-t border-b border-white/20 px-4 py-3 bg-black backdrop-blur-sm">
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
                  className="font-cartograph text-white"
                  style={{
                    fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                    fontWeight: "600",
                  }}
                >
                  0/3
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-white/40 to-white/50 h-2 rounded-full transition-all duration-500"
                  style={{ width: "0%" }}
                ></div>
              </div>
              <p
                className="font-sans text-white/80"
                style={{
                  fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                  lineHeight: "1.5",
                  fontWeight: "400",
                }}
              >
                Secure at least 1 Angel to boost proposal strength
              </p>
            </div>

            {/* Main Action Section */}
            <div className="p-6 sm:p-8 space-y-6 overflow-hidden">
              {/* Primary Input Request Form Card - Main Focal Point */}
              <div className="relative">
                <div className="text-center p-6 sm:p-8">
                  <button
                    onClick={handleOpenModal}
                    className="animated-request-button"
                  >
                    <span>Fill Out the form</span>
                  </button>
                </div>
              </div>

              {/* Angel Guidance Section */}
              <div className="border border-white/30 rounded-2xl bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-lg p-6 shadow-xl">
                <div className="mb-4">
                  <div>
                    <h3
                      className="font-sans font-bold text-white mb-2"
                      style={{
                        fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                        lineHeight: "1.3",
                        fontWeight: "700",
                      }}
                    >
                      Strengthen Your Proposal
                    </h3>
                    <div className="space-y-3">
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
                          No Angels detected? Mint to boost.
                        </p>

                        {/* Social Media Cards */}
                        <div className="main">
                          <div className="up">
                            <button className="card1">
                              <svg viewBox="0 0 16 16" className="instagram" height="25" width="25" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"></path>
                              </svg>
                            </button>
                            <button className="card2">
                              <svg viewBox="0 0 16 16" className="twitter" height="25" width="25" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"></path>
                              </svg>
                            </button>
                          </div>
                          <div className="down">
                            <button className="card3">
                              <svg viewBox="0 0 16 16" className="github" height="25" width="25" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                              </svg>
                            </button>
                            <button className="card4">
                              <svg viewBox="0 0 16 16" className="discord" height="25" width="25" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019z"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Azura Your Request Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || isTyping}
                  className="btn-70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating
                    ? "Calculating decision-matrix...."
                    : isTyping
                      ? "Combining elements..."
                      : "send"}
                </button>
              </div>
              <div className="text-center">
                <p
                  className="font-sans text-white/70"
                  style={{
                    fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                    lineHeight: "1.5",
                    fontWeight: "400",
                  }}
                >
                  Fees power the agent and member's time
                  <br />
                </p>
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
