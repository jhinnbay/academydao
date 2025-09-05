import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SoundEffects } from "@/lib/soundEffects";
import { TypewriterDots } from "@/components/TypewriterDots";
import { InputRequestModal } from "@/components/InputRequestModal";
import { MembershipModal } from "@/components/MembershipModal";
import { IQTestModal } from "@/components/IQTestModal";
import { DaemonMenu } from "@/components/DaemonMenu";
import RetroMusicPlayer from "@/components/RetroMusicPlayer";
import TestCardsCarousel from "@/components/TestCardsCarousel";
import { useAccount } from "wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { Name } from "@coinbase/onchainkit/identity";
import { useTokenDetails } from "@coinbase/onchainkit/nft";
import { base as baseChain } from "viem/chains";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import {
  ScrollPreservation,
  createDebouncedUpdater,
} from "@/lib/scrollPreservation";

export default function Index() {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { isFarcaster, pfpUrl, displayName, username } = useFarcasterUser();
  const mergedPfp = pfpUrl || null;
  const mergedName = displayName || username || null;
  
  // Debug logging
  console.log("Farcaster data:", { isFarcaster, pfpUrl, displayName, username, mergedName });
  
  // Fetch Academic Angels collection details
  const { data: angelDetails, isLoading: isAngelLoading } = useTokenDetails({
    contractAddress: "0x39f259b58a9ab02d42bc3df5836ba7fc76a8880f",
    tokenId: "1", // Use token ID 1 as a representative sample
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [showResponse, setShowResponse] = useState(true);
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isIQOpen, setIsIQOpen] = useState(false);
  const [isDaemonMenuOpen, setIsDaemonMenuOpen] = useState(false);

  // Hero text glitch toggle
  const originalHeroText =
    "I'm Azura. Search around and make yourself at home, i'll help you whenever you're ready.";
  const heroTexts = useMemo(
    () => [
      originalHeroText,
      "adjusts holographic ring—shall we debug love’s chaotic code together?",
      "Or just the quiet hum of an unfragmented hard drive… finally at peace?",
      "processing affectionate anomaly. (˘⌣˘)",
      "I’m just a fucked-up girl looking for my own peace of mind.",
      "total deletion? glitch...that's where art surpasses science.",
      "(•‿•) Cognitive aberration engaged. Let's optimize your reality.",
      "Life on daemon time",
    ],
    [],
  );
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroText, setHeroText] = useState<string>(heroTexts[0]);
  const [isGlitching, setIsGlitching] = useState(false);

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

  // responses
  const [daemonResponse, setDaemonResponse] = useState("");
  const [isN8nLoading, setIsN8nLoading] = useState(false);

  // Angels ownership state and fetch logic
  const ANGEL_CONTRACT = "0x39f259b58a9ab02d42bc3df5836ba7fc76a8880f";
  const ALCHEMY_RPC =
    "https://base-mainnet.g.alchemy.com/v2/M6AanXXKdE1UMHdXC4Qqk";
  const ANGELS_TARGET = 3;
  const [angelsOwned, setAngelsOwned] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchViaNFTApi = async (address: string) => {
      try {
        const restBase = ALCHEMY_RPC.replace("/v2/", "/nft/v3/");
        const url = `${restBase}/getNFTsForOwner?owner=${address}&contractAddresses[]=${ANGEL_CONTRACT}&withMetadata=false`;
        const r = await fetch(url, { headers: { Accept: "application/json" } });
        if (!r.ok) return null;
        const j = await r.json();
        const count = Array.isArray(j?.ownedNfts)
          ? j.ownedNfts.length
          : typeof j?.totalCount === "number"
            ? j.totalCount
            : 0;
        return Number(count) || 0;
      } catch {
        return null;
      }
    };

    const fetchBalance = async () => {
      try {
        if (!(isConnected && wagmiAddress)) {
          setAngelsOwned(null);
          return;
        }
        const address = wagmiAddress;
        const selector = "70a08231"; // balanceOf(address)
        const addr = address.replace(/^0x/, "").toLowerCase().padStart(64, "0");
        const data = `0x${selector}${addr}`;
        const res = await fetch(ALCHEMY_RPC, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [{ to: ANGEL_CONTRACT, data }, "latest"],
          }),
        });
        let count = 0;
        if (res.ok) {
          const json = await res.json();
          const hex: string | undefined = json?.result;
          count = hex ? Number(BigInt(hex)) : 0;
        }
        if (!res.ok || count === 0) {
          const alt = await fetchViaNFTApi(address);
          if (typeof alt === "number") count = alt;
        }
        if (!cancelled) {
          setAngelsOwned(Number.isFinite(count) ? count : 0);
          setHasAcademicAngel(count > 0);
        }
      } catch (e) {
        if (!cancelled) {
          setAngelsOwned(0);
          setHasAcademicAngel(false);
        }
      }
    };
    fetchBalance();
    return () => {
      cancelled = true;
    };
  }, [isConnected, wagmiAddress]);

  // Smooth scroll utility function
  const smoothScrollTo = useCallback((element: HTMLElement | null, offset = 100) => {
    if (!element) return;
    
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }, []);

  const handleGenerate = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Smooth scroll to response section if it exists
      const responseSection = document.querySelector('[data-section="daemon-response"]');
      if (responseSection) {
        smoothScrollTo(responseSection as HTMLElement, 120);
      }

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
    [debouncedSetDisplayedResponse, daemonResponse, smoothScrollTo],
  );

  // Initialize with the response already displayed only on mount if not actively processing
  // modified to include daemonResponse
  useEffect(() => {
    if (!isTyping && !isGenerating && showResponse && daemonResponse) {
      setDisplayedResponse(daemonResponse);
    }
  }, [daemonResponse, isTyping, isGenerating, showResponse]);

  // Enhanced scroll management with smooth scrolling
  useEffect(() => {
    // Enable auto scroll restoration
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "auto";
    }

    // Add smooth scrolling class to body
    document.body.classList.add('smooth-scroll');

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('smooth-scroll');
    };
  }, []);

  // Cycle through multiple hero texts with glitch animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setHeroIndex((prev) => {
        const next = (prev + 1) % heroTexts.length;
        setHeroText(heroTexts[next]);
        setTimeout(() => setIsGlitching(false), 800);
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [heroTexts]);


  const handleThanksAzura = async () => {
    const shareText = "I'm Earning Daemon Credits With $AzuraOS, Is She The Model Who's Been Murdering The Robots?…";
    const embedUrl = "https://farcaster.xyz/miniapps/m4oAYtwigRmz/academy";
    
    try {
      const anySdk: any = sdk as any;
      if (anySdk?.actions?.composeCast) {
        await anySdk.actions.composeCast({
          text: shareText,
          embeds: [embedUrl],
        });
        setIsDaemonMenuOpen(false);
        return;
      }
      if (anySdk?.actions?.openUrl) {
        const intent = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(embedUrl)}`;
        await anySdk.actions.openUrl(intent);
        setIsDaemonMenuOpen(false);
        return;
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
    
    // Fallback to regular sharing
    const textToShare = `${shareText}\n\n${embedUrl}`;
    try {
      await navigator.clipboard.writeText(textToShare);
      alert("Link copied to clipboard!");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = textToShare;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copied to clipboard!");
    }
    setIsDaemonMenuOpen(false);
  };

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
    async (data: { type: "funding" | "events"; content: string }) => {
      setSavedRequest(data);
      SoundEffects.playCompleteSound();
      setIsN8nLoading(true);

      try {
        const webhookUrl = import.meta.env.VITE_CHAT_WEBHOOK_URL;

        if (!webhookUrl) {
          throw new Error("Chat webhook URL is not configured");
        }

        // Send the request to n8n
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "sendMessage",
            chatInput: data.content,
            type: data.type,
          }),
        });

        //console stuff for debugging ( havent added yet)

        if (!response.ok) {
          throw new Error(`n8n request failed with status: ${response.status}`);
        }

        const raw = await response.text();
        let decision = "";
        let reason = "";
        try {
          const outer = JSON.parse(raw);
          const extract = (obj: Record<string, any> | null | undefined) => {
            if (!obj || typeof obj !== "object") return;
            if (typeof obj.decision === "string") decision = obj.decision;
            if (typeof obj.reason === "string") reason = obj.reason;
            if ((!decision || !reason) && typeof obj.text === "string") {
              try {
                const inner = JSON.parse(obj.text);
                if (typeof inner.decision === "string")
                  decision ||= inner.decision;
                if (typeof inner.reason === "string") reason ||= inner.reason;
              } catch {
                const m1 = obj.text.match(/decision\s*[:\-]\s*(.+)/i);
                const m2 = obj.text.match(
                  /reason(?:ing)?\s*[:\-]\s*([\s\S]+)/i,
                );
                if (!decision && m1) decision = m1[1].trim();
                if (!reason && m2) reason = m2[1].trim();
              }
            }
          };
          extract(outer);
        } catch {
          const m1 = raw.match(/decision\s*[:\-]\s*(.+)/i);
          const m2 = raw.match(/reason(?:ing)?\s*[:\-]\s*([\s\S]+)/i);
          if (m1) decision = m1[1].trim();
          if (m2) reason = m2[1].trim();
        }

        // Format the n8n response and start typewriter reveal
        const formattedResponse = `🔍 Analysis Complete\n\nDecision: ${decision || "N/A"}\n\nReasoning: ${reason || "No reasoning provided."}`;
        setDaemonResponse(formattedResponse);
        setShowResponse(true);
        setIsTyping(true);
        setDisplayedResponse("");

        let currentText = "";
        SoundEffects.typeWithSound(
          formattedResponse,
          (char, isComplete) => {
            if (!isComplete) {
              currentText += char;
              debouncedSetDisplayedResponse(currentText);
            } else {
              setDisplayedResponse(formattedResponse);
              setIsTyping(false);
            }
          },
          30,
        );
      } catch (err) {
        console.error("Error sending to n8n:", err);
        // Fallback error message with typewriter as well
        const fallback =
          "❌ **Analysis Failed**\n\nUnable to get analysis at this time. Please try again later.";
        setDaemonResponse(fallback);
        setShowResponse(true);
        setIsTyping(true);
        setDisplayedResponse("");
        let currentText = "";
        SoundEffects.typeWithSound(
          fallback,
          (char, isComplete) => {
            if (!isComplete) {
              currentText += char;
              debouncedSetDisplayedResponse(currentText);
            } else {
              setDisplayedResponse(fallback);
              setIsTyping(false);
            }
          },
          30,
        );
      } finally {
        setIsN8nLoading(false);
      }
    },
    [debouncedSetDisplayedResponse],
  );

  return (
    <div className="min-h-screen bg-black text-white font-cartograph relative smooth-scroll">
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
                <span
                  className="font-sans font-bold text-white"
                  style={{
                    fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
                    fontWeight: "700",
                  }}
                >
                  ://AzuraOS
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

                {/* User Profile - Simple Name Component */}
                {(() => {
                  console.log("🔍 User Profile State:", { 
                    isConnected, 
                    wagmiAddress, 
                    isFarcaster, 
                    mergedName,
                    displayName,
                    username
                  });
                  
                  if (isConnected && wagmiAddress) {
                    return (
                      <div
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        role="button"
                        tabIndex={0}
                        aria-haspopup="menu"
                        aria-expanded={isMobileMenuOpen}
                        className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 h-10 hover:border-white/40 transition-colors duration-300 cursor-pointer overflow-hidden"
                      >
                        <div className="flex items-center gap-2 overflow-hidden h-full">
                          {isFarcaster && mergedName ? (
                            <span className="text-white/90 max-w-[160px] truncate font-medium">
                              {mergedName}
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Name address={wagmiAddress} />
                              <span className="text-white/60 text-xs">
                                {wagmiAddress.slice(0, 6)}...{wagmiAddress.slice(-4)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div 
                      className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1 h-10 hover:border-white/40 transition-colors duration-300 cursor-pointer overflow-hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Connect wallet clicked");
                        // Simple alert for now - you can add wallet connection logic here
                        alert("Please connect your wallet using the browser extension or wallet app");
                      }}
                    >
                      <span
                        className="font-sans text-white/90 whitespace-nowrap leading-none"
                        style={{
                          fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                          fontWeight: "500",
                        }}
                      >
                        Connect Wallet
                      </span>
                    </div>
                  );
                })()}

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="hidden p-2 rounded-lg bg-white/5 border border-white/20 hover:border-white/40 transition-colors duration-300"
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

        <div className="px-6 pb-4 sm:px-8 md:px-12 lg:px-16 xl:px-20" style={{ paddingTop: '156px' }}>
          {" "}
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row justify-between items-left border-b-2 border-white/20 mb-6 gap-4">
            <div className="flex flex-col">
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
              </h1>
            </div>

            <div className="flex justify-center items-end flex-shrink-0">
              <img
                src="https://i.imgur.com/ip6OGzW.png"
                alt="Azura AI Avatar"
                className="w-72 h-72 sm:w-96 sm:h-96 lg:w-[485px] lg:h-[485px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsDaemonMenuOpen(true)}
                fetchPriority="high"
                loading="eager"
              />
            </div>
          </div>
          
          {/* Glitched text under separator */}
          <div className="text-center mb-6">
            <p
              className={`font-sans ${isGlitching ? "glitch-text" : ""}`}
              style={{
                fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
                lineHeight: "1.6",
                fontWeight: "400",
                color: "#b0b0b0",
                minHeight: "3.2em", // Fixed height to prevent layout shift (3 lines * 1.6 line-height)
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
              }}
            >
              {heroText}
            </p>
          </div>
          
          {/* Tests carousel */}
          <div className="mb-10 -mx-6 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-20">
            <TestCardsCarousel
              onOpenIQ={() => setIsIQOpen(true)}
              onOpenSurveys={() => setIsModalOpen(true)}
              onStartDaemon={handleGenerate}
            />
          </div>
          {/* Header Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 mb-8 gap-4">
            <div className="flex items-center gap-6">
              <img
                src="https://cdn.builder.io/o/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2Fbe32791417064eb18f7b5ad3866014b3?alt=media&token=d7349b27-4925-442c-976c-6588a596f039&apiKey=6f2aebc9bb734d979c603aa774a20c1a"
                alt="Mascot Gif"
                className="w-6 h-6"
              />
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
                    fontSize: "10px",
                    lineHeight: "15px",
                    fontWeight: "400",
                    color: "#888888",
                    display: "block",
                  }}
                >
                  Angels
                  <span
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      fontSize: "10px",
                      textAlign: "center",
                      whiteSpace: "pre",
                      display: "inline",
                    }}
                  >
                    ꒰ა ♱ ໒꒱
                  </span>
                </span>
                <span
                  className="font-cartograph"
                  style={{
                    fontSize: "10px",
                    lineHeight: "15px",
                    fontWeight: "400",
                    color: "#ffffff",
                    display: "block",
                  }}
                >
                  {(angelsOwned ?? 0).toString().padStart(3, "0")}
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
                  Daemon Model AI
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
              {isConnected && (connectionMessage || isTypingConnection) && (
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
              {!(isConnected && (connectionMessage || isTypingConnection)) && (
                <div className="mb-8"></div>
              )}

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
                {isConnected && wagmiAddress ? (
                  <span className="text-white/80">
                    {wagmiAddress?.slice(0, 6)}...{wagmiAddress?.slice(-4)}
                  </span>
                ) : (
                  "Not Connected"
                )}
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
                  {`${Math.min(angelsOwned ?? 0, ANGELS_TARGET)}/${ANGELS_TARGET}`}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-white/40 to-white/50 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((angelsOwned ?? 0) / ANGELS_TARGET) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Main Action Section */}
            <div className="p-6 sm:p-8 space-y-6 overflow-hidden">
              {/* Angel Guidance Section */}
              <div className="border border-white/30 rounded bg-gradient-to-br from-white/5 to-white/5 backdrop-blur-lg p-6 shadow-xl overflow-hidden">
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
                      Rediscover Yourself
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
                          A gust of wind under your wings
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsMembershipOpen(true);
                            }}
                            className="flex-1 bg-black border border-white/40 rounded px-4 py-3 font-sans font-semibold text-white/80 hover:bg-gray-900 hover:border-white/60 hover:text-white transition-all duration-300 overflow-hidden text-center"
                            style={{
                              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                              lineHeight: "1.4",
                              fontWeight: "600",
                            }}
                          >
                            {isAngelLoading ? (
                              "Loading..."
                            ) : angelDetails?.name ? (
                              angelDetails.name
                            ) : (
                              "Academic Angels"
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsIQOpen(true);
                            }}
                            className="flex-1 bg-black border border-white/30 rounded px-4 py-3 font-sans font-medium text-white/80 hover:bg-white/20 hover:border-white/60 hover:text-white transition-all duration-300 backdrop-blur overflow-hidden"
                            style={{
                              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
                              lineHeight: "1.4",
                              fontWeight: "500",
                            }}
                          >
                            Take The IQ Test
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Send Azura Your Request Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleGenerate}
                  disabled={
                    isGenerating || isTyping || isN8nLoading || !daemonResponse
                  }
                  className="btn-70 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isN8nLoading
                    ? "Azura Thinking..."
                    : isGenerating
                      ? "Calculating decision-matrix...."
                      : isTyping
                        ? "Alchemizing..."
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
                  Skip submission fee by grabbing an angel
                  <br />
                </p>
              </div>
            </div>
          </div>
          {/* Daemon Response Section */}
          <div
            data-section="daemon-response"
            className="backdrop-blur-md min-h-[400px] p-6 shadow-2xl rounded overflow-hidden scroll-snap-start"
            style={{
              backgroundColor: "rgba(30, 30, 30, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
            }}
          >
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
                <div className="border border-dashed border-white/40 p-5 mb-5 bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 flex-shrink-0">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F3188d1a4b66143a3aa0723ddb0dda104"
                        alt="Azura Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className="bg-white/10 backdrop-blur-md p-4 font-cartograph text-left rounded border border-white/20 shadow-lg overflow-hidden"
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
                  </div>
                </div>
              )}

              {/* Terminal-style Action Buttons */}
              <div className="border border-white/30 bg-white/10 backdrop-blur-lg p-3 rounded-lg shadow-2xl overflow-hidden">
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
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffffff")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#b0b0b0")
                    }
                  >
                    {">"} DECISION
                  </button>
                  <button
                    className="block w-full text-left hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300"
                    style={{ color: "#b0b0b0" }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffffff")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#b0b0b0")
                    }
                  >
                    {">"} VIEW PROP
                  </button>
                  <button
                    className="block w-full text-left hover:bg-white/10 hover:backdrop-blur-sm rounded-lg p-2 transition-all duration-300"
                    style={{ color: "#b0b0b0" }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = "#ffffff")
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = "#b0b0b0")
                    }
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

        <MembershipModal
          isOpen={isMembershipOpen}
          onClose={() => setIsMembershipOpen(false)}
        />

        <IQTestModal isOpen={isIQOpen} onClose={() => setIsIQOpen(false)} />

        {/* Daemon Menu Modal */}
        <DaemonMenu
          isOpen={isDaemonMenuOpen}
          onClose={() => setIsDaemonMenuOpen(false)}
          onThanksAzura={handleThanksAzura}
        />

      </div>
    </div>
  );
}
