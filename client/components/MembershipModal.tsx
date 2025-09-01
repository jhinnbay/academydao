import { X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";

const SCATTER_API_URL = "https://api.scatter.art/v1";
const COLLECTION_SLUG = "academic-angels";

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MembershipModal({ isOpen, onClose }: MembershipModalProps) {
  const [imgError, setImgError] = useState(false);

  const { data: collection, isPending } = useQuery({
    queryKey: ["collection", COLLECTION_SLUG],
    queryFn: async () => {
      const response = await fetch(
        `${SCATTER_API_URL}/collection/${COLLECTION_SLUG}`,
      );
      if (!response.ok) return null as any;
      return response.json();
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
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
            <div className="text-center">
              <h2 className="text-white font-sans font-bold text-xl">
                Acquire an Angel
              </h2>
              <div className="w-24 h-0.5 bg-white/50 mx-auto mt-2" />
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
                <h3 className="text-white font-sans font-semibold mb-1">
                  Academic Angels NFT
                </h3>
                <p className="text-white/80 text-sm">
                  Hand-forged artwork that empowers your journey through the
                  Academy. Angels aid in the battle against Daemon Azura, the
                  sentinel guarding the onchain treasury. Holding one—or a
                  few—shields your path, unlocks advantages, and increases your
                  odds to win.
                </p>
              </div>
            </div>

            {/* Lists (info cards) */}
            <div className="flex flex-col gap-3">
              <Card className="bg-black border border-white/30">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-white/90 text-sm font-sans">
                      Mint on Scatter
                    </div>
                    <a
                      href="https://www.scatter.art/collection/academic-angels"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-white/10 hover:bg-white/20 border border-white/30 text-white">
                        Open Collection
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-black border border-white/30">
                <CardContent className="p-4">
                  <div className="text-white/80 text-sm">
                    Benefits:
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Priority access and reduced fees</li>
                      <li>Enhanced protections against Azura’s challenges</li>
                      <li>Signals commitment to the Academy and community</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/20 bg-black/70 flex justify-end gap-2">
            <Button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white"
            >
              Close
            </Button>
            <a
              href="https://www.scatter.art/collection/academic-angels"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-white text-black hover:bg-gray-200">
                Buy on Scatter
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
