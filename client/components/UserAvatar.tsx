// components/UserAvatar.tsx
import { Avatar as OnchainkitAvatar } from "@coinbase/onchainkit/identity";
import { base as baseChain } from "viem/chains";
import { useFarcasterUser } from "@/hooks/useFarcasterUser";
import { useAccount } from "wagmi";

interface UserAvatarProps {
  size?: number;
  className?: string;
}

export function UserAvatar({ size = 8, className = "" }: UserAvatarProps) {
  const { address: wagmiAddress, isConnected } = useAccount();
  const { isFarcaster, pfpUrl } = useFarcasterUser();
  
  if (!isConnected || !wagmiAddress) {
    return (
      <div className={`w-${size} h-${size} bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center ${className}`}>
        <svg className={`w-${size/2} h-${size/2} text-white`} fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-white/10 ${className}`}>
      {isFarcaster && pfpUrl ? (
        <img
          src={pfpUrl}
          alt="Profile"
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <OnchainkitAvatar
          address={wagmiAddress}
          chain={baseChain}
          className="w-full h-full"
        />
      )}
    </div>
  );
}