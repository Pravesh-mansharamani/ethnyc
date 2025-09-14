import { tool } from 'ai';
import { z } from 'zod';
import { getOpenSeaMCPClient } from '../mcp-client';
import { resolveMultipleAddresses, resolveMultipleProfiles } from '@/lib/ens-resolver';

// Helper function to extract addresses from OpenSea data
function extractAddressesFromData(data: any): string[] {
  const addresses: string[] = [];
  
  function traverse(obj: any) {
    if (typeof obj === 'string' && /^0x[a-fA-F0-9]{40}$/.test(obj)) {
      addresses.push(obj);
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(traverse);
    }
  }
  
  traverse(data);
  return [...new Set(addresses)]; // Remove duplicates
}

// Helper function to enhance data with ENS information
async function enhanceWithENS(data: any, includeProfiles = false) {
  const addresses = extractAddressesFromData(data);
  
  if (addresses.length === 0) {
    return data;
  }

  try {
    let ensData: Map<string, any>;
    
    if (includeProfiles) {
      ensData = await resolveMultipleProfiles(addresses);
    } else {
      const ensNames = await resolveMultipleAddresses(addresses);
      ensData = new Map();
      ensNames.forEach((name, address) => {
        ensData.set(address, { name, avatar: null });
      });
    }

    // Add ENS information to the response
    const enhancedData = {
      ...data,
      _ensData: Object.fromEntries(
        Array.from(ensData.entries()).map(([address, ensInfo]) => [
          address.toLowerCase(),
          includeProfiles ? ensInfo : { name: ensInfo.name, avatar: ensInfo.avatar }
        ])
      ),
      _addressCount: addresses.length,
    };

    return enhancedData;
  } catch (error) {
    console.error('Failed to enhance with ENS data:', error);
    return data;
  }
}

// Helper function to safely get and initialize the MCP client
async function getSafeOpenSeaMCPClient() {
  try {
    const client = getOpenSeaMCPClient();
    await client.connect();
    return client;
  } catch (error) {
    console.error('Failed to initialize OpenSea MCP client:', error);
    throw new Error('OpenSea MCP service is currently unavailable');
  }
}

export const openSeaSearch = tool({
  description: 'AI-powered search across OpenSea marketplace data for NFTs, collections, tokens, and more. Automatically resolves ENS names for wallet addresses.',
  inputSchema: z.object({
    query: z.string().describe('Search query (e.g., "BONK token", "trending NFTs", "gaming collections")'),
    limit: z.number().min(1).max(100).default(20).optional().describe('Number of results to return'),
    includeENSProfiles: z.boolean().default(false).optional().describe('Include full ENS profiles with avatars and social links'),
  }),
  execute: async ({ query, limit, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('search', { query, limit });
      
      // Enhance response with ENS data
      const enhancedResponse = await enhanceWithENS(response, includeENSProfiles);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error in OpenSea search:', error);
      return {
        error: true,
        message: `Failed to search OpenSea: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const fetchEntity = tool({
  description: 'Retrieve full details of a specific OpenSea entity by ID with ENS resolution for addresses',
  inputSchema: z.object({
    entity_id: z.string().describe('The unique identifier of the OpenSea entity'),
    includeENSProfiles: z.boolean().default(true).optional().describe('Include full ENS profiles with avatars and social links'),
  }),
  execute: async ({ entity_id, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('fetch', { entity_id });
      
      // Enhance response with ENS data
      const enhancedResponse = await enhanceWithENS(response, includeENSProfiles);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error fetching entity:', error);
      return {
        error: true,
        message: `Failed to fetch entity: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const searchCollections = tool({
  description: 'Search for NFT collections by name, description, or metadata with ENS resolution',
  inputSchema: z.object({
    query: z.string().describe('Search query for collections (e.g., "Azuki", "art NFT collections")'),
    chain: z.string().optional().describe('Blockchain to search on (e.g., "ethereum", "polygon")'),
    limit: z.number().min(1).max(100).default(20).optional().describe('Number of collections to return'),
    includeENSProfiles: z.boolean().default(false).optional().describe('Include full ENS profiles for creator addresses'),
  }),
  execute: async ({ query, chain, limit, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('search_collections', { query, chain, limit });
      
      // Enhance response with ENS data
      const enhancedResponse = await enhanceWithENS(response, includeENSProfiles);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error searching collections:', error);
      return {
        error: true,
        message: `Failed to search collections: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const getCollection = tool({
  description: 'Get detailed information about a specific NFT collection with ENS resolution for creator and owner addresses',
  inputSchema: z.object({
    collection_slug: z.string().describe('The collection slug (e.g., "boredapeyachtclub", "cryptopunks")'),
    includeENSProfiles: z.boolean().default(true).optional().describe('Include full ENS profiles with avatars and social links'),
  }),
  execute: async ({ collection_slug, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('get_collection', { collection_slug });
      
      // Enhance response with ENS data
      const enhancedResponse = await enhanceWithENS(response, includeENSProfiles);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error getting collection:', error);
      return {
        error: true,
        message: `Failed to get collection: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const searchItems = tool({
  description: 'Search for individual NFT items/tokens across OpenSea with ENS resolution for owner addresses',
  inputSchema: z.object({
    query: z.string().describe('Search query for NFT items (e.g., "Bored Ape #1234", "rare Azuki traits")'),
    collection: z.string().optional().describe('Filter by specific collection slug'),
    traits: z.record(z.string(), z.string()).optional().describe('Filter by traits (trait_type: trait_value)'),
    limit: z.number().min(1).max(100).default(20).optional().describe('Number of items to return'),
    includeENSProfiles: z.boolean().default(true).optional().describe('Include full ENS profiles for owner addresses'),
  }),
  execute: async ({ query, collection, traits, limit, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('search_items', { query, collection, traits, limit });
      
      // Enhance response with ENS data
      const enhancedResponse = await enhanceWithENS(response, includeENSProfiles);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error searching items:', error);
      return {
        error: true,
        message: `Failed to search items: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const getItem = tool({
  description: 'Get detailed information about a specific NFT including price history and owner ENS information',
  inputSchema: z.object({
    contract_address: z.string().describe('The contract address of the NFT'),
    token_id: z.string().describe('The token ID of the NFT'),
    include_orders: z.boolean().default(false).optional().describe('Include current orders/listings'),
    includeENSProfiles: z.boolean().default(true).optional().describe('Include full ENS profiles with avatars and social links'),
  }),
  execute: async ({ contract_address, token_id, include_orders, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('get_item', { contract_address, token_id, include_orders });
      
      // Enhance response with ENS data
      const enhancedResponse = await enhanceWithENS(response, includeENSProfiles);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error getting item:', error);
      return {
        error: true,
        message: `Failed to get item: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const searchTokens = tool({
  description: 'Search for cryptocurrencies and tokens',
  inputSchema: z.object({
    query: z.string().describe('Search query for tokens (e.g., "USDC", "PEPE coin")'),
    chain: z.string().optional().describe('Blockchain to search on'),
    limit: z.number().min(1).max(100).default(20).optional().describe('Number of tokens to return'),
  }),
  execute: async ({ query, chain, limit }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('search_tokens', { query, chain, limit });
      return response;
    } catch (error) {
      console.error('Error searching tokens:', error);
      return {
        error: true,
        message: `Failed to search tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const getToken = tool({
  description: 'Get information about a specific cryptocurrency token',
  inputSchema: z.object({
    address: z.string().describe('Token contract address'),
    chain: z.string().optional().describe('Blockchain the token is on'),
  }),
  execute: async ({ address, chain }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('get_token', { address, chain });
      return response;
    } catch (error) {
      console.error('Error getting token:', error);
      return {
        error: true,
        message: `Failed to get token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const getTokenSwapQuote = tool({
  description: 'Get a swap quote and blockchain actions for token swap',
  inputSchema: z.object({
    from_token: z.string().describe('Source token address or symbol'),
    to_token: z.string().describe('Destination token address or symbol'),
    amount: z.string().describe('Amount to swap (in token units)'),
    from_address: z.string().describe('Wallet address performing the swap'),
    chain: z.string().optional().describe('Blockchain to perform swap on'),
  }),
  execute: async ({ from_token, to_token, amount, from_address, chain }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('get_token_swap_quote', { 
        from_token, 
        to_token, 
        amount, 
        from_address, 
        chain 
      });
      return response;
    } catch (error) {
      console.error('Error getting swap quote:', error);
      return {
        error: true,
        message: `Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

export const getTokenBalances = tool({
  description: 'Retrieve all token balances for a wallet address',
  inputSchema: z.object({
    address: z.string().describe('Wallet address to check balances for'),
    chain: z.string().optional().describe('Blockchain to check (default: ethereum)'),
    include_nfts: z.boolean().default(true).optional().describe('Include NFT balances'),
    includeENSProfiles: z.boolean().default(false).optional().describe('Include ENS profile for the wallet address (disabled by default)'),
  }),
  execute: async ({ address, chain, include_nfts, includeENSProfiles }) => {
    try {
      const client = await getSafeOpenSeaMCPClient();
      const response = await client.callTool('get_token_balances', { address, chain, include_nfts });
      
      // Return raw response without ENS enhancement
      return response;
    } catch (error) {
      console.error('Error getting token balances:', error);
      return {
        error: true,
        message: `Failed to get token balances: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});