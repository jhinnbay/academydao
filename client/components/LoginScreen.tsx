import React from "react";
import { usePrivy } from "@privy-io/react-auth";

export function LoginScreen() {
  const { login } = usePrivy();

  return (
    <div className="min-h-screen bg-black text-white font-cartograph relative">
      {/* Grainy texture background */}
      <div
        className="absolute inset-0 opacity-30 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2Fd4a87124b9ed45468d4be9ac29f49116?format=webp&width=800')`,
          filter:
            "grayscale(100%) brightness(0.05) contrast(3) saturate(0%) hue-rotate(0deg)",
        }}
      ></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-3xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F6f2aebc9bb734d979c603aa774a20c1a%2F907173652fac434888a7b68f5b83718e?format=webp&width=800"
              alt="Mental Wealth Academy"
              className="h-16 w-16 rounded-lg object-cover mx-auto mb-4"
            />
            <h1 className="text-3xl font-bold text-white mb-2">
              Mental Wealth Academy
            </h1>
            <p className="text-white/80">
              Connect to access your academic funding and collaboration platform
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => login()}
              className="w-full bg-gradient-to-r from-cyan-600/80 via-blue-600/70 to-cyan-600/80 backdrop-blur-xl border border-cyan-400/50 rounded-2xl font-sans font-semibold hover:from-cyan-500/90 hover:via-blue-500/80 hover:to-cyan-500/90 hover:border-cyan-300/80 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-cyan-900/20 relative overflow-hidden group py-4 px-6 text-white"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
              <span className="relative z-10 drop-shadow-sm">
                Connect with Privy
              </span>
            </button>

            <div className="text-center">
              <p className="text-white/60 text-sm">
                Supports wallets, email, social logins, and Farcaster
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
