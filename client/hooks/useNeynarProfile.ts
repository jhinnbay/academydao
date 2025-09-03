import { useQuery } from "@tanstack/react-query";

export interface NeynarProfile {
  fid: number | null;
  username: string | null;
  displayName: string | null;
  pfpUrl: string | null;
  bio?: string | null;
  followerCount?: number | null;
  followingCount?: number | null;
}

interface Params {
  fid?: string | number | null;
  username?: string | null;
  address?: string | null | undefined;
}

export function useNeynarProfile({ fid, username, address }: Params) {
  const key = ["neynar-profile", fid ?? null, username ?? null, address ?? null];
  const query = useQuery<NeynarProfile, Error>({
    queryKey: key,
    enabled: Boolean(fid || username || address),
    queryFn: async () => {
      const qs = new URLSearchParams();
      if (fid) qs.set("fid", String(fid));
      if (username) qs.set("username", String(username));
      if (address) qs.set("address", String(address));
      const res = await fetch(`/api/farcaster/profile?${qs.toString()}`);
      if (!res.ok) throw new Error(`Failed to load profile (${res.status})`);
      return (await res.json()) as NeynarProfile;
    },
    staleTime: 5 * 60 * 1000,
  });
  return query;
}
