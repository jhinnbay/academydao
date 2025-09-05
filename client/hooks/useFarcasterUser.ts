import { sdk } from "@farcaster/miniapp-sdk";

function hasFarcasterContext() {
  if (typeof window === "undefined") return false;
  const anySdk: any = sdk as any;
  const ctx = anySdk?.context || (window as any)?.__FARCASTER_MINIAPP_CONTEXT;
  const user = (ctx as any)?.user ?? (ctx as any)?.viewer ?? null;
  return Boolean(user);
}

export function useFarcasterUser() {
  // Remove useMemo to allow dynamic updates when Farcaster context changes
  try {
    const anySdk: any = sdk as any;
    const context =
      anySdk?.context || (window as any)?.__FARCASTER_MINIAPP_CONTEXT || null;
    const fcUser = (context as any)?.user ?? (context as any)?.viewer ?? null;

    console.log("Farcaster context debug:", { context, fcUser, anySdk });

    const source = fcUser || {};

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

    const isFarcaster = Boolean(hasFarcasterContext());

    console.log("Farcaster user data extracted:", { isFarcaster, pfpUrl, displayName, username, source });

    return { isFarcaster, pfpUrl, displayName, username };
  } catch (error) {
    console.warn("Error in useFarcasterUser:", error);
    return { isFarcaster: false, pfpUrl: undefined, displayName: undefined, username: undefined };
  }
}
