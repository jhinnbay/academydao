import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export const PrivyAuth: React.FC = () => {
  const { ready, authenticated, user, logout, login } = usePrivy();

  // Get Farcaster account if available
  const farcasterAccount = user?.linkedAccounts?.find(
    (account) => account.type === "farcaster"
  );

  if (!ready) {
    return (
      <button
        className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-white/10 to-white/10 bg-black transition-colors duration-300"
        style={{
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "12px",
          paddingRight: "12px",
          fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
          lineHeight: "1.6",
          fontWeight: "500",
          color: "#ffffff",
        }}
        disabled
      >
        Loading...
      </button>
    );
  }

  if (authenticated && user) {
    // If user has Farcaster, show username and avatar
    if (farcasterAccount) {
      return (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2">
            {/* Farcaster avatar */}
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img
                src={farcasterAccount.pfp || "https://via.placeholder.com/32x32/6366f1/ffffff?text=FC"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://via.placeholder.com/32x32/6366f1/ffffff?text=FC";
                }}
              />
            </div>
            <div className="flex flex-col">
              <span
                className="font-sans text-white/90"
                style={{
                  fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
                  fontWeight: "500",
                }}
              >
                @{farcasterAccount.username || "farcaster"}
              </span>
              <span
                className="font-sans text-white/60"
                style={{
                  fontSize: "clamp(0.625rem, 1vw, 0.75rem)",
                  fontWeight: "400",
                }}
              >
                Farcaster
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="border border-white/20 bg-gradient-to-b from-red-400/10 to-red-400/10 bg-black hover:bg-gray-900 transition-colors duration-300 px-3 py-2 rounded-lg"
            style={{
              fontSize: "clamp(0.75rem, 1.2vw, 0.875rem)",
              fontWeight: "500",
              color: "#ffffff",
            }}
          >
            Disconnect
          </button>
        </div>
      );
    }

    // Regular disconnect button for non-Farcaster users
    return (
      <button
        onClick={logout}
        className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-red-400/10 to-red-400/10 bg-black hover:bg-gray-900 transition-colors duration-300"
        style={{
          paddingTop: "8px",
          paddingBottom: "8px",
          paddingLeft: "12px",
          paddingRight: "12px",
          fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
          lineHeight: "1.6",
          fontWeight: "500",
          color: "#ffffff",
        }}
      >
        Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={login}
      className="flex justify-center items-center gap-2 border border-white/20 bg-gradient-to-b from-white/10 to-white/10 bg-black hover:bg-gray-900 transition-colors duration-300"
      style={{
        paddingTop: "8px",
        paddingBottom: "8px",
        paddingLeft: "12px",
        paddingRight: "12px",
        fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
        lineHeight: "1.6",
        fontWeight: "500",
        color: "#ffffff",
      }}
    >
      Connect with Farcaster
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F0c9076778bee4070892566189ad8c894?format=webp&width=800"
        alt="Atom Icon"
        className="w-4 h-4 object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </button>
  );
};
