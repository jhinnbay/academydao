import { useMemo } from "react";
import { useMiniAppContext } from "@farcaster/miniapp-sdk";

function isFarcasterEnvironment() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  const isFramed = window.self !== window.top;
  return /farcaster/i.test(ua) || isFramed;
}

export function useFarcasterUser() {
  const { context } = useMiniAppContext?.() ?? ({} as any);
  const data = useMemo(() => {
    const fc = isFarcasterEnvironment();
    const user = (context as any)?.user ?? (context as any)?.viewer ?? null;
    const profile = user || {};
    const pfpUrl: string | undefined = profile.pfpUrl || profile.pfp || profile.profileImage || undefined;
    const displayName: string | undefined = profile.displayName || profile.name || undefined;
    const username: string | undefined = profile.username || profile.handle || undefined;
    return { isFarcaster: fc, pfpUrl, displayName, username };
  }, [context]);
  return data;
}
