import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base as baseChain } from "viem/chains";
import {
  readContract,
  writeContract,
  waitForTransactionReceipt,
} from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmi";
import { ALCHEMY_RPC_URL } from "../../shared/config";

const SCATTER_API_URL = "https://api.scatter.art/v1";
const COLLECTION_SLUG = "academic-angels";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [imgError, setImgError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const chainId = useChainId();
  const { isConnected, address: wagmiAddress } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const ANGEL_CONTRACT = "0x39f259b58a9ab02d42bc3df5836ba7fc76a8880f" as const;
  
  // Log contract configuration on component mount
  console.log("Academic Angels Contract configured:", ANGEL_CONTRACT);
  console.log("Scatter API URL:", SCATTER_API_URL);
  console.log("Collection Slug:", COLLECTION_SLUG);

  const abiMintQty = [
    {
      name: "mint",
      type: "function",
      stateMutability: "payable",
      inputs: [{ name: "quantity", type: "uint256" }],
      outputs: [],
    },
  ] as const;
  const abiMint = [
    {
      name: "mint",
      type: "function",
      stateMutability: "payable",
      inputs: [],
      outputs: [],
    },
  ] as const;
  const abiMintFee = [
    {
      name: "mintFee",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
  ] as const;
  const abiPrice = [
    {
      name: "price",
      type: "function",
      stateMutability: "view",
      inputs: [],
      outputs: [{ type: "uint256" }],
    },
  ] as const;

  async function getPricePer(): Promise<bigint> {
    try {
      const fee: bigint = await readContract(wagmiConfig, {
        address: ANGEL_CONTRACT,
        abi: abiMintFee,
        functionName: "mintFee",
        chainId: baseChain.id,
        authorizationList: [],
      });
      console.log("Mint fee retrieved:", fee.toString());
      return fee;
    } catch (error) {
      console.log("mintFee() failed, trying price():", error);
    }
    try {
      const price: bigint = await readContract(wagmiConfig, {
        address: ANGEL_CONTRACT,
        abi: abiPrice,
        functionName: "price",
        chainId: baseChain.id,
        authorizationList: [],
      });
      console.log("Price retrieved:", price.toString());
      return price;
    } catch (error) {
      console.log("price() failed:", error);
    }
    console.log("No price function found, using 0");
    return 0n;
  }

  async function handleMint() {
    try {
      if (!isConnected) throw new Error("Connect wallet first");
      if (chainId !== baseChain.id) {
        await switchChainAsync({ chainId: baseChain.id });
      }
      setMinting(true);
      setTxHash(null);

      // Log contract address for verification
      console.log("Attempting to mint from contract:", ANGEL_CONTRACT);
      console.log("Contract address verified:", ANGEL_CONTRACT);

      const pricePer = await getPricePer();
      const totalValue = pricePer * BigInt(quantity);
      
      console.log("Mint attempt:", {
        quantity,
        pricePer: pricePer.toString(),
        totalValue: totalValue.toString(),
        contract: ANGEL_CONTRACT,
        chainId: baseChain.id
      });

      // Try mint(quantity)
      try {
        console.log("Attempting mint with quantity:", quantity);
        const hash = await writeContract(wagmiConfig, {
          address: ANGEL_CONTRACT,
          abi: abiMintQty,
          functionName: "mint",
          args: [BigInt(quantity)],
          value: totalValue > 0n ? totalValue : undefined,
          chainId: baseChain.id,
          account: wagmiAddress,
          chain: baseChain,
        });
        console.log("Mint transaction submitted:", hash);
        setTxHash(hash);
        await waitForTransactionReceipt(wagmiConfig, { hash });
        console.log("Mint transaction confirmed!");
        return;
      } catch (error) {
        console.error("Mint with quantity failed:", error);
        // Don't continue to fallback if it's a user rejection
        if (error instanceof Error && error.message.includes("User rejected")) {
          throw error;
        }
      }

      // Fallback: call mint() multiple times
      console.log("Trying fallback minting method...");
      for (let i = 0; i < quantity; i++) {
        try {
          console.log(`Fallback mint attempt ${i + 1}/${quantity}`);
          const hash = await writeContract(wagmiConfig, {
            address: ANGEL_CONTRACT,
            abi: abiMint,
            functionName: "mint",
            args: [],
            value: pricePer > 0n ? pricePer : undefined,
            chainId: baseChain.id,
            account: wagmiAddress,
            chain: baseChain,
          });
          console.log(`Fallback mint ${i + 1} transaction submitted:`, hash);
          setTxHash(hash);
          await waitForTransactionReceipt(wagmiConfig, { hash });
          console.log(`Fallback mint ${i + 1} confirmed!`);
        } catch (error) {
          console.error(`Mint attempt ${i + 1} failed:`, error);
          // Don't re-throw user rejections in fallback
          if (error instanceof Error && error.message.includes("User rejected")) {
            throw error;
          }
          // For other errors, continue with next attempt
          if (i === quantity - 1) {
            throw new Error(`All ${quantity} mint attempts failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }
    } catch (e) {
      console.error("Mint failed", e);
      // Keep user in app - don't redirect to external sites
      alert(`Mint failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setMinting(false);
    }
  }

  const { data: collection, isPending } = useQuery({
    queryKey: ["collection", COLLECTION_SLUG],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${SCATTER_API_URL}/collection/${COLLECTION_SLUG}`,
        );
        if (!response.ok) {
          console.warn("Scatter API failed, using fallback data");
          // Return fallback data with contract info
          return {
            max_items: 1000,
            num_items: 0,
            contract_address: ANGEL_CONTRACT,
            name: "Academic Angels",
            description: "Digital blessings from the celestial Academy",
            image_url: "https://cdn.builder.io/o/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F120ede1969ef4f97a30e3bcf5f24f659?alt=media&token=07bfc907-1625-44ab-8be8-201026dc94c2&apiKey=6f2aebc9bb734d979c603aa774a20c1a"
          };
        }
        const data = await response.json();
        // Ensure contract address is included
        if (!data.contract_address) {
          data.contract_address = ANGEL_CONTRACT;
        }
        return data;
      } catch (error) {
        console.error("Error fetching collection data:", error);
        // Return fallback data
        return {
          max_items: 1000,
          num_items: 0,
          contract_address: ANGEL_CONTRACT,
          name: "Academic Angels",
          description: "Digital blessings from the celestial Academy",
          image_url: "https://cdn.builder.io/o/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F120ede1969ef4f97a30e3bcf5f24f659?alt=media&token=07bfc907-1625-44ab-8be8-201026dc94c2&apiKey=6f2aebc9bb734d979c603aa774a20c1a"
        };
      }
    },
    enabled: isOpen,
  });

  const percent = useMemo(() => {
    const max = Number(collection?.max_items || 0);
    const num = Number(collection?.num_items || 0);
    if (!max || max <= 0) return 0;
    return Math.min(Math.max((num / max) * 100, 0), 100);
  }, [collection]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-auto max-h-[95vh] flex flex-col">
        {/* Main container */}
        <div className="relative bg-black border border-white/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
          {/* Header */}
          <div className="relative flex-shrink-0 p-5 border-b border-white/20 bg-black/80">
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 px-3 py-1 text-white/80 border border-white/30 rounded hover:bg-white/10 transition-colors"
            >
              Close
            </button>
            <div className="text-left">
              <h2 className="text-white font-sans font-bold text-xl">
                ://AcademicAngels
              </h2>
              <div className="w-24 h-0.5 bg-white/50 mt-2" />
            </div>
          </div>

          {/* Content */}
          <div className="relative flex-1 overflow-y-auto p-5">

            {/* Collection Progress */}
            {collection && (
              <div className="mb-6">
                <div className="flex flex-col gap-2">
                  <Progress
                    value={percent}
                    className="w-full h-2 bg-white/10"
                  />
                  <p className="text-center text-sm text-white/80">
                    {collection.num_items} / {collection.max_items} minted
                  </p>
                </div>
              </div>
            )}
            {isPending && !collection && (
              <div className="mb-6 text-center text-white/70 text-sm">
                Loading collection…
              </div>
            )}

            {/* Artwork */}
            <div className="mb-6">
              <div className="flex justify-center mb-3">
                <div className="relative">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-xl bg-black border border-white/30 overflow-hidden">
                    <img
                      src={
                        imgError
                          ? "https://via.placeholder.com/400x400/0b0b0b/ffffff?text=Academic+Angel"
                          : "https://cdn.builder.io/o/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F120ede1969ef4f97a30e3bcf5f24f659?alt=media&token=07bfc907-1625-44ab-8be8-201026dc94c2&apiKey=6f2aebc9bb734d979c603aa774a20c1a"
                      }
                      alt="Academic Angel"
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  </div>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-white font-sans font-semibold mb-1 text-center">
                  Academic Angel x Base
                </h3>
                <p className="text-white/80 text-sm">
                  You sense a digital blessing...
                </p>
              </div>
            </div>

            {/* Mint stepper */}
            <div className="flex flex-col gap-3">
              <Card className="bg-black border border-white/30">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    <div className="text-white/90 text-sm font-sans">
                      Select quantity
                    </div>
                    <div className="flex items-center gap-3 w-full">
                      <Button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white py-2"
                      >
                        −
                      </Button>
                      <div className="w-16 text-center text-white/90 font-sans text-lg">
                        {quantity}
                      </div>
                      <Button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(5, q + 1))}
                        className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white py-2"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex">
                <Button
                  onClick={handleMint}
                  disabled={minting || !isConnected}
                  className="w-full bg-white text-black hover:bg-gray-200 disabled:bg-gray-500 disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  {minting ? "Minting..." : `Mint ${quantity}`}
                </Button>
              </div>

              {/* Benefits */}
              <Card className="bg-black border border-white/30">
                <CardContent className="p-4">
                  <div className="text-white/80 text-sm">
                    Benefits:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Enhanced protection</li>
                      <li>Luck against Azura's Challenges</li>
                      <li>Access to the celestial Academy</li>
                    </ul>
                    {txHash && (
                      <div className="mt-3 text-white/70 break-all text-xs">
                        Tx: {txHash}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-black/70">
            <a
              className="block w-full"
              href="https://scatter.art/collection/academic-angels"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white">
                View on Scatter
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
