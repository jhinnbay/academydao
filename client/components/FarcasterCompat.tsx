import React, { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

interface FarcasterCompatProps {
  children: React.ReactNode;
}

export const FarcasterCompat: React.FC<FarcasterCompatProps> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const ua = window.navigator.userAgent || "";
      const isFramed = window.self !== window.top;
      const isFC = /farcaster/i.test(ua) || isFramed;
      if (isFC) {
        document.documentElement.classList.add("fc-miniapp");
      }

      const callReady = () => sdk.actions.ready().catch(() => {});

      // Call ready immediately without waiting for load to prevent splash hang
      callReady();
      // Try again on next frame and shortly after to ensure MiniKit receives it
      requestAnimationFrame(callReady);
      const t = setTimeout(callReady, 600);

      setInitialized(true);
      return () => {
        clearTimeout(t);
        if (isFC) document.documentElement.classList.remove("fc-miniapp");
      };
    } catch {
      // Non-Farcaster environments
      setInitialized(true);
    }
  }, []);

  return <>{children}</>;
};
