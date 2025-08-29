import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export const PrivyAuth: React.FC = () => {
  const { ready, authenticated, user, logout, login } = usePrivy();

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
      Get Started
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F0c9076778bee4070892566189ad8c894?format=webp&width=800"
        alt="Atom Icon"
        className="w-4 h-4 object-contain"
        style={{ filter: "brightness(0) invert(1)" }}
      />
    </button>
  );
};
