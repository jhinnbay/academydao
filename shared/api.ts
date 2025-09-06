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
 * Friend data for leaderboard
 */
export interface FriendData {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  address?: string;
  tokenBalance: number;
}

/**
 * Response type for /api/friends-leaderboard
 */
export interface FriendsLeaderboardResponse {
  friends: FriendData[];
  totalCount: number;
}
