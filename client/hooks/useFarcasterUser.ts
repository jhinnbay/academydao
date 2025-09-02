import { useMemo } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import { usePrivy } from "@privy-io/react-auth";

function hasFarcasterContext() {
  if (typeof window === "undefined") return false;
  const anySdk: any = sdk as any;
  const ctx = anySdk?.context || (window as any)?.__FARCASTER_MINIAPP_CONTEXT;
  const user = (ctx as any)?.user ?? (ctx as any)?.viewer ?? null;
  return Boolean(user);
}

export function useFarcasterUser() {
  const { user: privyUser } = usePrivy();

  const data = useMemo(() => {
    const anySdk: any = sdk as any;
    const context =
      anySdk?.context || (window as any)?.__FARCASTER_MINIAPP_CONTEXT || null;
    const fcUser = (context as any)?.user ?? (context as any)?.viewer ?? null;

    // Extract Farcaster info from Privy if available
    const privyFc: any =
      (privyUser as any)?.farcaster ||
      (privyUser as any)?.linkedAccounts?.find?.(
        (a: any) => a?.type === "farcaster"
      ) ||
      null;

    const source = fcUser || privyFc || {};

    const pfpUrl: string | undefined =
      source.pfpUrl ||
      source.pfp ||
      source.profileImage ||
      source.profile_image_url ||
      source.profilePictureUrl ||
      source.photoURL ||
      undefined;

    const displayName: string | undefined =
      source.displayName || source.name || source.fullName || undefined;

    const username: string | undefined =
      source.username || source.handle || source.fname || undefined;

    const isFarcaster = Boolean(hasFarcasterContext() || privyFc);

    return { isFarcaster, pfpUrl, displayName, username };
  }, [privyUser]);

  return data;
}
