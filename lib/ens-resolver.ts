import { createPublicClient, http, isAddress } from 'viem';
import { mainnet, arbitrum, base, linea, optimism, scroll } from 'viem/chains';

// Chain configurations for ENS resolution
const CHAINS = [
  { chain: mainnet, name: 'Ethereum' },
  { chain: arbitrum, name: 'Arbitrum' },
  { chain: base, name: 'Base' },
  { chain: linea, name: 'Linea' },
  { chain: optimism, name: 'OP Mainnet' },
  { chain: scroll, name: 'Scroll' },
];

// Enhanced interface for ENS data
export interface ENSProfile {
  name: string | null;
  avatar: string | null;
  description: string | null;
  email: string | null;
  url: string | null;
  twitter: string | null;
  github: string | null;
  discord: string | null;
  telegram: string | null;
  contentHash: string | null;
  loading: boolean;
  error: string | null;
}

// Cache for resolved names and profiles to avoid repeated API calls
const ensCache = new Map<string, string | null>();
const ensProfileCache = new Map<string, ENSProfile>();

/**
 * Resolves a wallet address to its ENS name across multiple chains
 * @param address - The wallet address to resolve
 * @returns Promise<string | null> - The ENS name if found, null otherwise
 */
export async function resolveAddressToENS(address: string): Promise<string | null> {
  if (!isAddress(address)) {
    return null;
  }

  const normalizedAddress = address.toLowerCase();

  // Check cache first
  if (ensCache.has(normalizedAddress)) {
    return ensCache.get(normalizedAddress) || null;
  }

  try {
    // Try resolving on Ethereum mainnet with multiple RPC endpoints
    const rpcEndpoints = [
      process.env.ETHEREUM_RPC_URL,
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth',
      'https://eth.public-rpc.com',
    ].filter(Boolean);

    for (const rpcUrl of rpcEndpoints) {
      try {
        const mainnetClient = createPublicClient({
          chain: mainnet,
          transport: http(rpcUrl),
        });

        const ensName = await mainnetClient.getEnsName({
          address: address as `0x${string}`,
        });

        if (ensName) {
          ensCache.set(normalizedAddress, ensName);
          return ensName;
        }
      } catch (error) {
        console.debug(`ENS resolution failed with RPC ${rpcUrl}:`, error);
        continue; // Try next RPC endpoint
      }
    }

    // If no ENS name found on mainnet, try other chains
    for (const { chain, name: chainName } of CHAINS.slice(1)) {
      try {
        const client = createPublicClient({
          chain,
          transport: http(),
        });

        // For non-mainnet chains, we need to check if they have reverse resolution
        // Most L2s don't have native ENS support, but some might have it
        const reverseRecord = await client.getEnsName({
          address: address as `0x${string}`,
        }).catch(() => null);

        if (reverseRecord) {
          ensCache.set(normalizedAddress, reverseRecord);
          return reverseRecord;
        }
      } catch (error) {
        // Continue to next chain if this one fails
        console.debug(`ENS resolution failed on ${chainName}:`, error);
        continue;
      }
    }

    // No ENS name found, cache null result
    ensCache.set(normalizedAddress, null);
    return null;
  } catch (error) {
    console.error('ENS resolution error:', error);
    ensCache.set(normalizedAddress, null);
    return null;
  }
}

/**
 * Resolves ENS avatar from text records
 * @param ensName - The ENS name to resolve avatar for
 * @returns Promise<string | null> - The avatar URL if found
 */
export async function resolveENSAvatar(ensName: string): Promise<string | null> {
  const rpcEndpoints = [
    process.env.ETHEREUM_RPC_URL,
    'https://ethereum.publicnode.com',
    'https://rpc.ankr.com/eth',
    'https://eth.public-rpc.com',
  ].filter(Boolean);

  for (const rpcUrl of rpcEndpoints) {
    try {
      const mainnetClient = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });

      const avatar = await mainnetClient.getEnsAvatar({
        name: ensName,
      });

      if (avatar) {
        return avatar;
      }
    } catch (error) {
      console.debug(`ENS avatar resolution failed with RPC ${rpcUrl}:`, error);
      continue; // Try next RPC endpoint
    }
  }

  console.error('ENS avatar resolution failed on all RPC endpoints for:', ensName);
  return null;
}

/**
 * Resolves comprehensive ENS profile including avatar and text records
 * @param address - The wallet address to resolve profile for
 * @returns Promise<ENSProfile> - Complete ENS profile data
 */
export async function resolveENSProfile(address: string): Promise<ENSProfile> {
  const normalizedAddress = address.toLowerCase();
  
  // Check cache first
  if (ensProfileCache.has(normalizedAddress)) {
    return ensProfileCache.get(normalizedAddress)!;
  }

  const defaultProfile: ENSProfile = {
    name: null,
    avatar: null,
    description: null,
    email: null,
    url: null,
    twitter: null,
    github: null,
    discord: null,
    telegram: null,
    contentHash: null,
    loading: true,
    error: null,
  };

  // Set loading state
  ensProfileCache.set(normalizedAddress, defaultProfile);

  try {
    // First resolve the ENS name
    const ensName = await resolveAddressToENS(address);
    
    if (!ensName) {
      const noEnsProfile = { ...defaultProfile, loading: false };
      ensProfileCache.set(normalizedAddress, noEnsProfile);
      return noEnsProfile;
    }

    // Try multiple RPC endpoints for profile resolution
    const rpcEndpoints = [
      process.env.ETHEREUM_RPC_URL,
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth',
      'https://eth.public-rpc.com',
    ].filter(Boolean);

    let avatar = null, description = null, email = null, url = null, twitter = null, 
        github = null, discord = null, telegram = null, contentHash = null;

    // Try each RPC endpoint until we get successful results
    for (const rpcUrl of rpcEndpoints) {
      try {
        const mainnetClient = createPublicClient({
          chain: mainnet,
          transport: http(rpcUrl),
        });

        // Resolve avatar and text records in parallel
        // Try multiple formats for social media keys
        const results = await Promise.allSettled([
          mainnetClient.getEnsAvatar({ name: ensName }),
          mainnetClient.getEnsText({ name: ensName, key: 'description' }),
          mainnetClient.getEnsText({ name: ensName, key: 'email' }),
          mainnetClient.getEnsText({ name: ensName, key: 'url' }),
          mainnetClient.getEnsText({ name: ensName, key: 'com.twitter' }),
          mainnetClient.getEnsText({ name: ensName, key: 'twitter' }), // Alternative Twitter key
          mainnetClient.getEnsText({ name: ensName, key: 'com.github' }),
          mainnetClient.getEnsText({ name: ensName, key: 'github' }), // Alternative GitHub key
          mainnetClient.getEnsText({ name: ensName, key: 'com.discord' }),
          mainnetClient.getEnsText({ name: ensName, key: 'org.telegram' }),
          mainnetClient.getEnsText({ name: ensName, key: 'contenthash' }),
        ]);

        // Extract successful results
        avatar = results[0].status === 'fulfilled' ? results[0].value : null;
        description = results[1].status === 'fulfilled' ? results[1].value : null;
        email = results[2].status === 'fulfilled' ? results[2].value : null;
        url = results[3].status === 'fulfilled' ? results[3].value : null;
        // Try both Twitter key formats
        twitter = (results[4].status === 'fulfilled' ? results[4].value : null) || 
                  (results[5].status === 'fulfilled' ? results[5].value : null);
        // Try both GitHub key formats  
        github = (results[6].status === 'fulfilled' ? results[6].value : null) ||
                 (results[7].status === 'fulfilled' ? results[7].value : null);
        discord = results[8].status === 'fulfilled' ? results[8].value : null;
        telegram = results[9].status === 'fulfilled' ? results[9].value : null;
        contentHash = results[10].status === 'fulfilled' ? results[10].value : null;

        // If we got at least some data, break out of the loop
        if (avatar || description || email || url || twitter || github || discord || telegram) {
          break;
        }
      } catch (error) {
        console.debug(`ENS profile resolution failed with RPC ${rpcUrl}:`, error);
        continue; // Try next RPC endpoint
      }
    }

    const profile: ENSProfile = {
      name: ensName,
      avatar,
      description,
      email,
      url,
      twitter,
      github,
      discord,
      telegram,
      contentHash,
      loading: false,
      error: null,
    };

    ensProfileCache.set(normalizedAddress, profile);
    return profile;
  } catch (error) {
    const errorProfile: ENSProfile = {
      ...defaultProfile,
      loading: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    ensProfileCache.set(normalizedAddress, errorProfile);
    return errorProfile;
  }
}

/**
 * Formats an address with ENS name if available
 * @param address - The wallet address
 * @param ensName - The resolved ENS name (optional)
 * @returns Formatted string with ENS name or full address
 */
export function formatAddressWithENS(address: string, ensName?: string | null): string {
  if (ensName) {
    return ensName;
  }
  
  // Return full address if no ENS name
  return address;
}

/**
 * Resolves multiple addresses to ENS names in parallel
 * @param addresses - Array of wallet addresses to resolve
 * @returns Promise<Map<string, string | null>> - Map of address to ENS name
 */
export async function resolveMultipleAddresses(addresses: string[]): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  
  const promises = addresses.map(async (address) => {
    const ensName = await resolveAddressToENS(address);
    return { address: address.toLowerCase(), ensName };
  });

  const resolved = await Promise.allSettled(promises);
  
  resolved.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.set(result.value.address, result.value.ensName);
    } else {
      results.set(addresses[index].toLowerCase(), null);
    }
  });

  return results;
}

/**
 * Resolves multiple addresses to full ENS profiles in parallel
 * @param addresses - Array of wallet addresses to resolve profiles for
 * @returns Promise<Map<string, ENSProfile>> - Map of address to ENS profile
 */
export async function resolveMultipleProfiles(addresses: string[]): Promise<Map<string, ENSProfile>> {
  const results = new Map<string, ENSProfile>();
  
  const promises = addresses.map(async (address) => {
    const profile = await resolveENSProfile(address);
    return { address: address.toLowerCase(), profile };
  });

  const resolved = await Promise.allSettled(promises);
  
  resolved.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      results.set(result.value.address, result.value.profile);
    } else {
      const errorProfile: ENSProfile = {
        name: null,
        avatar: null,
        description: null,
        email: null,
        url: null,
        twitter: null,
        github: null,
        discord: null,
        telegram: null,
        contentHash: null,
        loading: false,
        error: 'Failed to resolve profile',
      };
      results.set(addresses[index].toLowerCase(), errorProfile);
    }
  });

  return results;
}

/**
 * Clears the ENS cache (useful for testing or manual refresh)
 */
export function clearENSCache(): void {
  ensCache.clear();
  ensProfileCache.clear();
}

/**
 * Gets cache statistics
 */
export function getENSCacheStats(): { 
  names: { size: number; entries: string[] };
  profiles: { size: number; entries: string[] };
} {
  return {
    names: {
      size: ensCache.size,
      entries: Array.from(ensCache.keys()),
    },
    profiles: {
      size: ensProfileCache.size,
      entries: Array.from(ensProfileCache.keys()),
    },
  };
} 