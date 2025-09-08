import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FriendsLeaderboard } from "./FriendsLeaderboard"
import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { X } from "lucide-react"

interface DaemonMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onThanksAzura: () => void;
}

export function DaemonMenu({ isOpen, onClose, onThanksAzura }: DaemonMenuProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [azuraBalance, setAzuraBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { address, isConnected } = useAccount();

  const AZURAOS_CONTRACT = "0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07";
  // Use public RPC endpoint instead of API key
  const ALCHEMY_RPC = "https://mainnet.base.org";

  const fetchAzuraBalance = async (walletAddress: string) => {
    try {
      setIsLoadingBalance(true);
      
      // ERC-20 balanceOf function selector
      const selector = "70a08231";
      const addr = walletAddress.replace(/^0x/, "").toLowerCase().padStart(64, "0");
      const data = `0x${selector}${addr}`;
      
      const response = await fetch(ALCHEMY_RPC, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [{ to: AZURAOS_CONTRACT, data }, "latest"],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const hex = result?.result;
        if (hex && hex !== "0x" && hex !== "0x0") {
          // Convert hex to BigInt then to number (assuming 18 decimals)
          const balance = Number(BigInt(hex)) / Math.pow(10, 18);
          setAzuraBalance(balance);
        } else {
          setAzuraBalance(0);
        }
      } else {
        setAzuraBalance(0);
      }
    } catch (error) {
      console.error("Error fetching AzuraOS balance:", error);
      setAzuraBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchAzuraBalance(address);
    } else {
      setAzuraBalance(null);
    }
  }, [isConnected, address]);

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
        <div className="relative bg-black border border-white/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
          <div className="relative flex-shrink-0 p-5 border-b border-white/20 bg-black/80">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <h2 className="text-white font-sans font-bold text-xl">
                AzuraOS Daemon Credits
              </h2>
              <div className="w-28 h-0.5 bg-white/50 mx-auto mt-2" />
            </div>
          </div>

          <div className="relative flex-1 overflow-y-auto p-5 space-y-4">
            <p className="text-white/80 text-sm text-center">
              Enigmatic Ocean Ecosystem
            </p>

            {/* Main explanation */}
            <div className="text-white/80 text-sm leading-relaxed">
              <p className="mb-2">
                AzuraOS is a Daemon Model AI Agent with cognitive enhancements through the Daemon Layer. Azura leverages 40% of daemon tokens powering the ecosystem. Holders of 10,000+ $AzuraOS receive rewards.
              </p>
              <p className="mb-3">Unused credits refresh daily.</p>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h3 className="font-semibold text-white mb-2 border-b border-white/30 pb-1">Decision-Type</h3>
                <div className="space-y-1 text-white/80">
                  <div>Prompts</div>
                  <div>Proposals</div>
                  <div>Follows</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2 border-b border-white/30 pb-1">Amount Available</h3>
                <div className="space-y-1 text-white/80">
                  <div>25 $AzuraOS</div>
                  <div>500 $AzuraOS</div>
                  <div>100,000 $AzuraOS</div>
                </div>
              </div>
            </div>

            {/* Available credits */}
            <div className="text-center py-3 border-t border-white/20">
              <p className="text-sm text-white font-medium">
                Available Daemon Credits: {
                  isLoadingBalance 
                    ? "Loading..." 
                    : azuraBalance !== null 
                      ? `${azuraBalance.toFixed(2)} $AzuraOS`
                      : "Connect wallet to view balance"
                }
              </p>
            </div>

            {/* CTAs */}
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setIsLeaderboardOpen(true)}
                className="bg-white text-black hover:bg-gray-200"
              >
                Leaderboard
              </Button>
              <Button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white"
              >
                Thanks, Got it!
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Friends Leaderboard Modal */}
      <FriendsLeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        contractAddress="0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07"
      />
    </div>
  )
}
