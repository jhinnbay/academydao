import { RequestHandler } from "express";
import { NeynarUser, NeynarProfileResponse } from "@shared/api";

interface NeynarApiUser {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
}

interface NeynarApiResponse {
  [address: string]: NeynarApiUser[];
}

export const handleNeynarProfile: RequestHandler = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const url = `https://api.neynar.com/v2/farcaster/user/bulk-by-address?addresses=${address}`;
    const options = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': '5B907AF2-3087-49A8-88C6-DFA45CF19383'
      }
    };

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data: NeynarApiResponse = await response.json();
    const userData = data[address.toLowerCase()];

    if (!userData || userData.length === 0) {
      return res.json({ user: null });
    }

    // Return the first user found
    const user = userData[0];
    
    res.json({ 
      user: {
        fid: user.fid,
        username: user.username,
        displayName: user.display_name,
        pfpUrl: user.pfp_url,
        bio: user.profile.bio.text,
        followerCount: user.follower_count,
        followingCount: user.following_count,
        verifications: user.verifications,
        verifiedAddresses: user.verified_addresses,
        activeStatus: user.active_status,
        powerBadge: user.power_badge
      }
    });

  } catch (error) {
    console.error('Error fetching Neynar profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};