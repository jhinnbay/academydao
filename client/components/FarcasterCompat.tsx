import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FarcasterCompatProps {
  children: React.ReactNode;
}

export const FarcasterCompat: React.FC<FarcasterCompatProps> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        console.log("🚀 Initializing Farcaster MiniKit...");
        const ua = window.navigator.userAgent || "";
        const isFramed = window.self !== window.top;
        const isFC = /farcaster/i.test(ua) || isFramed;
        if (isFC) {
          document.documentElement.classList.add("fc-miniapp");
        }

        // Debug current domain
        console.log("Current domain:", window.location.hostname);
        console.log("Current URL:", window.location.href);

        // Check if accessing wrong domain (.dao instead of .app)
        if (window.location.hostname.includes(".dao")) {
          console.warn(
            "⚠️  Domain issue detected: accessing .dao instead of .app",
          );
          console.warn("Correct URL should be: https://academydao.vercel.app");
        }

        // Wait for the app to be fully loaded and mounted
        await new Promise((resolve) => {
          // Wait for React to finish mounting
          if (document.readyState === "complete") {
            setTimeout(resolve, 100);
          } else {
            window.addEventListener("load", () => setTimeout(resolve, 100));
          }
        });

        // Call sdk.actions.ready() to hide the splash screen
        console.log("✅ Calling sdk.actions.ready()");
        await sdk.actions.ready();

        console.log("✅ Farcaster MiniKit initialized successfully");

        // Additional ready call after a short delay to ensure it worked
        setTimeout(async () => {
          try {
            console.log("🔄 Second ready() call for extra reliability");
            await sdk.actions.ready();
          } catch (error) {
            console.warn(
              "⚠️ Second ready() call failed (this is usually fine):",
              error,
            );
          }
        }, 1000);

        setIsReady(true);
      } catch (error) {
        // Ensure class removal outside Mini App
        document.documentElement.classList.remove("fc-miniapp");
        console.warn("⚠️ Farcaster SDK error:", error);
        console.log(
          "��️ This is normal if not running in a Farcaster Mini App environment",
        );
        console.log("ℹ️ If you ARE in Farcaster and seeing this, check:");
        console.log(
          "   1. Correct domain: https://academydao.vercel.app (not .dao)",
        );
        console.log("   2. Mini App is properly configured in Farcaster");
        console.log(
          "   3. Manifest file is accessible at /.well-known/farcaster.json",
        );
        // Not in Farcaster environment, that's fine
        setIsReady(true);
      }
    };

    initializeFarcaster();
  }, []);

  // Always render children, the SDK call will handle the splash screen in Farcaster
  return <>{children}</>;
};
