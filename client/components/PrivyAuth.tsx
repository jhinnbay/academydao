import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export const PrivyAuth: React.FC = () => {
  const { ready, authenticated, user, logout, login } = usePrivy();

  if (!ready) {
    return (
      <button
        className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-cyan-400/10 to-cyan-400/10 bg-black transition-colors duration-300"
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
      className="flex justify-center items-center border border-white/20 bg-gradient-to-b from-cyan-400/10 to-cyan-400/10 bg-black hover:bg-gray-900 transition-colors duration-300"
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
    </button>
  );
};
