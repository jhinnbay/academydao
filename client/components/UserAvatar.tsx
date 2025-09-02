// components/UserAvatar.tsx
import { Avatar, Identity, Name, Badge, Address } from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";

interface UserAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  showName?: boolean;
  showAddress?: boolean;
  showBadge?: boolean;
  className?: string;
  schemaId?: string;
}

export function UserAvatar({ 
  size = "md", 
  showName = false,
  showAddress = false,
  showBadge = true,
  className = "",
  schemaId = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9" // Default schema ID from docs
}: UserAvatarProps) {
  const { address: wagmiAddress, isConnected } = useAccount();
  
  if (!isConnected || !wagmiAddress) {
    const sizeClasses = {
      sm: "w-6 h-6",
      md: "w-8 h-8", 
      lg: "w-12 h-12",
      xl: "w-16 h-16"
    };
    
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center ${className}`}>
        <svg className={`${size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-8 h-8"} text-white`} fill="currentColor" viewBox="0 0 20 20">
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
    <div className={`flex items-center gap-2 ${className}`}>
      <Identity
        address={wagmiAddress}
        schemaId={schemaId}
      >
        <Avatar className={`${size === "sm" ? "w-6 h-6" : size === "md" ? "w-8 h-8" : size === "lg" ? "w-12 h-12" : "w-16 h-16"}`}>
          {showBadge && <Badge tooltip="Verified Identity" />}
        </Avatar>
        
        {showName && (
          <Name>
            {showBadge && <Badge tooltip="Verified Identity" />}
          </Name>
        )}
        
        {showAddress && <Address />}
      </Identity>
    </div>
  );
}