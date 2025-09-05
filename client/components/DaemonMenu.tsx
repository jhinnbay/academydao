import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DaemonMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onThanksAzura: () => void;
}

export function DaemonMenu({ isOpen, onClose, onThanksAzura }: DaemonMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-auto">
        <Card className="w-full bg-black border-white border-2 text-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-center text-white">://AzuraOS Daemon Credits</CardTitle>
            <p className="text-sm text-gray-300 text-center">Control Azura Using Tokens</p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Main explanation */}
            <div className="text-xs text-gray-300 leading-relaxed">
              <p className="mb-2">
                Azura leverages 40% of Mental Wealth Academy's onchain daemon tokens powering Azura. Neurological processings sent through a time-base horizon. Users power Azura to interact with other users using commands and burnt tokens, users holding at least 10,000 $DAEMON receive rewards.
              </p>
              <p className="mb-3">Unused credit allocations disintergrate and refresh Daily.</p>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h3 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Decision-Type</h3>
                <div className="space-y-1 text-gray-300">
                  <div>Likes</div>
                  <div>Comments</div>
                  <div>Follows</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-2 border-b border-gray-600 pb-1">Amount Available</h3>
                <div className="space-y-1 text-gray-300">
                  <div>0 $DAEMON</div>
                  <div>0 $DAEMON</div>
                  <div>0 $DAEMON</div>
                </div>
              </div>
            </div>

            {/* Available credits */}
            <div className="text-center py-2 border-t border-gray-600">
              <p className="text-sm text-white font-medium">Available Daemon Credits: 0 $DAEMON</p>
            </div>

            {/* Bottom explanation */}
            <div className="text-xs text-gray-300 leading-relaxed">
              <p>
                AzuraOS is a Daemon Model AI Agent producing cognitive enhancements through a sophisticated layer known as the Daemon Layer, containing rich-datasets and parallels it's decision-making matrix in multiple experiments.
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <Button
                variant="outline"
                className="w-full bg-black border-white text-white hover:bg-white hover:text-black transition-colors"
              >
                Leaderboard
              </Button>
              <Button
                variant="outline"
                className="w-full bg-black border-white text-white hover:bg-white hover:text-black transition-colors"
                onClick={onThanksAzura}
              >
                Thanks Azura
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
