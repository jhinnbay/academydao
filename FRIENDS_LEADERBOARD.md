# Friends Leaderboard Feature

## Overview
The Friends Leaderboard feature allows users to see which of their Farcaster friends own tokens from a specific contract address. This feature is integrated into the Daemon Menu's "Leaderboard" button.

## How It Works

### 1. User Interaction
- User clicks on the "Leaderboard" button in the Daemon Menu
- The system checks if the user is connected via Farcaster
- If connected, it fetches the user's FID (Farcaster ID) from their username

### 2. Data Fetching
- The system fetches the user's following list from Neynar API
- For each friend, it checks their verified Ethereum addresses
- Token ownership is verified by calling the contract's `balanceOf` function
- Results are sorted by token balance (highest first)

### 3. Display
- Shows friend's avatar, display name, username, and token count
- Only displays friends who actually own tokens from the contract
- Includes loading states and error handling

## API Endpoints

### GET /api/friends-leaderboard
**Parameters:**
- `fid` (required): Farcaster ID of the user
- `contractAddress` (optional): Contract address to check (defaults to `0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07`)

**Response:**
```typescript
{
  friends: FriendData[];
  totalCount: number;
}
```

## Components

### FriendsLeaderboard
- Modal component that displays the leaderboard
- Handles loading states and error conditions
- Shows friend avatars, names, and token counts

### DaemonMenu
- Updated to include leaderboard functionality
- Opens the FriendsLeaderboard modal when "Leaderboard" is clicked

## Configuration

### Environment Variables
- `NEYNAR_API_KEY`: Required for accessing Farcaster data via Neynar API

### Contract Address
- Default: `0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07`
- Can be customized via the `contractAddress` prop

## Error Handling
- Handles cases where user is not connected to Farcaster
- Gracefully handles API failures
- Shows appropriate error messages to users
- Includes retry functionality

## Performance Considerations
- Token ownership checks are performed in parallel for all friends
- Uses both direct contract calls and NFT API fallback
- Implements proper loading states to improve UX
- Limits following list to 100 friends to prevent timeouts
