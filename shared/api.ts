/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Neynar profile response types
 */
export interface NeynarUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followerCount: number;
  followingCount: number;
  verifications: string[];
  verifiedAddresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  activeStatus: string;
  powerBadge: boolean;
}

export interface NeynarProfileResponse {
  user: NeynarUser | null;
}
