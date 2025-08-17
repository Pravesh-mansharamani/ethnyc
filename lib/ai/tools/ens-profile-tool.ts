import { tool } from 'ai';
import { z } from 'zod';
import { createPublicClient, http, isAddress } from 'viem';
import { mainnet } from 'viem/chains';
import { resolveENSProfile, resolveAddressToENS } from '@/lib/ens-resolver';

/**
 * Resolves ENS name to address with fallback RPC endpoints
 */
async function resolveENSNameToAddress(ensName: string): Promise<string | null> {
  const rpcEndpoints = [
    process.env.ETHEREUM_RPC_URL,
    'https://ethereum.publicnode.com',
    'https://rpc.ankr.com/eth',
    'https://eth.public-rpc.com',
    'https://ethereum.blockpi.network/v1/rpc/public',
  ].filter(Boolean);

  for (const rpcUrl of rpcEndpoints) {
    try {
      const client = createPublicClient({
        chain: mainnet,
        transport: http(rpcUrl),
      });

      const address = await client.getEnsAddress({
        name: ensName,
      });

      if (address) {
        return address;
      }
    } catch (error) {
      console.debug(`ENS resolution failed with RPC ${rpcUrl}:`, error);
      continue; // Try next RPC endpoint
    }
  }

  console.error('ENS name to address resolution failed on all RPC endpoints for:', ensName);
  return null;
}

export const resolveENSProfileTool = tool({
  description: 'Resolve ENS names (like vitalik.eth) to get wallet addresses and complete ENS profiles with avatars, bios, and social links. Also works for addresses to get ENS profiles.',
  inputSchema: z.object({
    input: z.string().describe('ENS name (e.g., "vitalik.eth") or Ethereum address (0x...)'),
  }),
  execute: async ({ input }) => {
    try {
      const trimmedInput = input.trim();
      
      // Check if input is an ENS name or address
      const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(trimmedInput);
      const isENSName = trimmedInput.includes('.eth') || trimmedInput.includes('.');
      
      if (isEthereumAddress) {
        // Input is an address - resolve to ENS profile
        if (!isAddress(trimmedInput)) {
          return {
            success: false,
            error: 'Invalid Ethereum address format',
            input: trimmedInput,
          };
        }

        const profile = await resolveENSProfile(trimmedInput);
        return {
          success: true,
          type: 'address_to_profile',
          input: trimmedInput,
          address: trimmedInput,
          ensName: profile.name,
          profile: {
            name: profile.name,
            avatar: profile.avatar,
            description: profile.description,
            email: profile.email,
            url: profile.url,
            twitter: profile.twitter,
            github: profile.github,
            discord: profile.discord,
            telegram: profile.telegram,
            contentHash: profile.contentHash,
          },
          hasENS: !!profile.name,
        };
      } else if (isENSName) {
        // Input is an ENS name - resolve to address and profile
        const address = await resolveENSNameToAddress(trimmedInput);
        
        if (!address) {
          return {
            success: false,
            error: `The ENS name "${trimmedInput}" could not be resolved. It may not exist, or there might be a network issue. Please check the spelling or try again later.`,
            input: trimmedInput,
            type: 'ens_name',
            suggestion: 'You can try searching for this person or entity using other methods, or check if the ENS name is spelled correctly.',
          };
        }

        const profile = await resolveENSProfile(address);
        return {
          success: true,
          type: 'ens_to_profile',
          input: trimmedInput,
          ensName: trimmedInput,
          address,
          profile: {
            name: profile.name || trimmedInput,
            avatar: profile.avatar,
            description: profile.description,
            email: profile.email,
            url: profile.url,
            twitter: profile.twitter,
            github: profile.github,
            discord: profile.discord,
            telegram: profile.telegram,
            contentHash: profile.contentHash,
          },
          hasENS: true,
        };
      } else {
        return {
          success: false,
          error: 'Input must be either an ENS name (e.g., vitalik.eth) or Ethereum address (0x...)',
          input: trimmedInput,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        input,
      };
    }
  },
});

export const batchResolveENS = tool({
  description: 'Resolve multiple ENS names or addresses at once to get their profiles efficiently.',
  inputSchema: z.object({
    inputs: z.array(z.string()).describe('Array of ENS names or Ethereum addresses to resolve'),
  }),
  execute: async ({ inputs }) => {
    try {
      const results: any[] = [];
      
      for (const input of inputs) {
        const trimmed = input.trim();
        const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(trimmed);
        const isENSName = trimmed.includes('.eth') || trimmed.includes('.');
        
        if (isEthereumAddress) {
          try {
            const profile = await resolveENSProfile(trimmed);
            results.push({
              input: trimmed,
              type: 'address_to_profile',
              address: trimmed,
              ensName: profile.name,
              profile: {
                name: profile.name,
                avatar: profile.avatar,
                description: profile.description,
                email: profile.email,
                url: profile.url,
                twitter: profile.twitter,
                github: profile.github,
                discord: profile.discord,
                telegram: profile.telegram,
                contentHash: profile.contentHash,
              },
              hasENS: !!profile.name,
            });
          } catch (error) {
            results.push({
              input: trimmed,
              error: error instanceof Error ? error.message : 'Resolution failed',
              hasENS: false,
            });
          }
        } else if (isENSName) {
          try {
            const address = await resolveENSNameToAddress(trimmed);
            if (address) {
              const profile = await resolveENSProfile(address);
              results.push({
                input: trimmed,
                type: 'ens_to_profile',
                ensName: trimmed,
                address,
                profile: {
                  name: profile.name || trimmed,
                  avatar: profile.avatar,
                  description: profile.description,
                  email: profile.email,
                  url: profile.url,
                  twitter: profile.twitter,
                  github: profile.github,
                  discord: profile.discord,
                  telegram: profile.telegram,
                  contentHash: profile.contentHash,
                },
                hasENS: true,
              });
            } else {
              results.push({
                input: trimmed,
                error: 'ENS name not found',
                hasENS: false,
              });
            }
          } catch (error) {
            results.push({
              input: trimmed,
              error: error instanceof Error ? error.message : 'Resolution failed',
              hasENS: false,
            });
          }
        } else {
          results.push({
            input: trimmed,
            error: 'Invalid format - must be ENS name or address',
            hasENS: false,
          });
        }
      }

      return {
        success: true,
        totalInputs: inputs.length,
        resolved: results.filter(r => !r.error).length,
        failed: results.filter(r => r.error).length,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Batch resolution failed',
        inputs,
      };
    }
  },
}); 