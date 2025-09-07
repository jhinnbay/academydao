// Shared configuration for the application
// Public configuration (safe to expose in client)
export const BASE_CHAIN_ID = 8453; // Base mainnet chain ID
export const ACADEMIC_ANGEL_CONTRACT = "0x39f259b58a9ab02d42bc3df5836ba7fc76a8880f";
export const AZURAOS_CONTRACT = "0x30b3d29062e82c36a9a0ba8dc83eed5fcdba3b07";

// Server-only configuration (loaded from environment variables)
// These will be available in Vercel environment variables
export const getServerConfig = () => {
  if (typeof window !== 'undefined') {
    throw new Error('getServerConfig() should only be called on the server side');
  }
  
  return {
    ALCHEMY_RPC_URL: process.env.ALCHEMY_RPC_URL,
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
  };
};
