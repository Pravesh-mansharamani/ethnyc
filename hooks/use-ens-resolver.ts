import { useState, useEffect, useCallback } from 'react';
import { 
  resolveAddressToENS, 
  resolveMultipleAddresses, 
  resolveENSProfile,
  resolveMultipleProfiles as resolveMultipleProfilesLib,
  formatAddressWithENS,
  type ENSProfile 
} from '@/lib/ens-resolver';

interface ENSResolutionState {
  [address: string]: {
    ensName: string | null;
    loading: boolean;
    error: string | null;
  };
}

interface ENSProfileState {
  [address: string]: ENSProfile;
}

export function useENSResolver() {
  const [resolutions, setResolutions] = useState<ENSResolutionState>({});
  const [profiles, setProfiles] = useState<ENSProfileState>({});

  const resolveAddress = useCallback(async (address: string) => {
    const normalizedAddress = address.toLowerCase();
    if (!address || resolutions[normalizedAddress]) {
      return; // Already resolved or resolving
    }

    // Set loading state
    setResolutions(prev => ({
      ...prev,
      [normalizedAddress]: {
        ensName: null,
        loading: true,
        error: null,
      },
    }));

    try {
      const ensName = await resolveAddressToENS(address);
      
      setResolutions(prev => ({
        ...prev,
        [normalizedAddress]: {
          ensName,
          loading: false,
          error: null,
        },
      }));
    } catch (error) {
      setResolutions(prev => ({
        ...prev,
        [normalizedAddress]: {
          ensName: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }));
    }
  }, []);

  const resolveProfile = useCallback(async (address: string) => {
    const normalizedAddress = address.toLowerCase();
    if (!address || profiles[normalizedAddress]) {
      return; // Already resolved or resolving
    }

    try {
      const profile = await resolveENSProfile(address);
      setProfiles(prev => ({
        ...prev,
        [normalizedAddress]: profile,
      }));

      // Also update the basic resolution state
      setResolutions(prev => ({
        ...prev,
        [normalizedAddress]: {
          ensName: profile.name,
          loading: profile.loading,
          error: profile.error,
        },
      }));
    } catch (error) {
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      setProfiles(prev => ({
        ...prev,
        [normalizedAddress]: errorProfile,
      }));
    }
  }, []);

  const resolveMultiple = useCallback(async (addresses: string[]) => {
    const addressesToResolve = addresses.filter(
      addr => addr && !resolutions[addr.toLowerCase()]
    );

    if (addressesToResolve.length === 0) {
      return;
    }

    // Set loading state for all addresses
    setResolutions(prev => {
      const updated = { ...prev };
      addressesToResolve.forEach(addr => {
        const normalizedAddress = addr.toLowerCase();
        updated[normalizedAddress] = {
          ensName: null,
          loading: true,
          error: null,
        };
      });
      return updated;
    });

    try {
      const results = await resolveMultipleAddresses(addressesToResolve);
      
      setResolutions(prev => {
        const updated = { ...prev };
        results.forEach((ensName, address) => {
          updated[address] = {
            ensName,
            loading: false,
            error: null,
          };
        });
        return updated;
      });
    } catch (error) {
      setResolutions(prev => {
        const updated = { ...prev };
        addressesToResolve.forEach(addr => {
          const normalizedAddress = addr.toLowerCase();
          updated[normalizedAddress] = {
            ensName: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        });
        return updated;
      });
    }
  }, []);

  const resolveMultipleProfiles = useCallback(async (addresses: string[]) => {
    const addressesToResolve = addresses.filter(
      addr => addr && !profiles[addr.toLowerCase()]
    );

    if (addressesToResolve.length === 0) {
      return;
    }

    try {
      const results = await resolveMultipleProfilesLib(addressesToResolve);
      
      setProfiles(prev => {
        const updated = { ...prev };
        for (const [address, profile] of results) {
          updated[address] = profile;
        }
        return updated;
      });

      // Also update basic resolution state
      setResolutions(prev => {
        const updated = { ...prev };
        for (const [address, profile] of results) {
          updated[address] = {
            ensName: profile.name,
            loading: profile.loading,
            error: profile.error,
          };
        }
        return updated;
      });
    } catch (error) {
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
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      setProfiles(prev => {
        const updated = { ...prev };
        addressesToResolve.forEach(addr => {
          const normalizedAddress = addr.toLowerCase();
          updated[normalizedAddress] = errorProfile;
        });
        return updated;
      });
    }
  }, []);

  const getDisplayName = useCallback((address: string): string => {
    const normalizedAddress = address.toLowerCase();
    const resolution = resolutions[normalizedAddress];
    
    if (resolution?.loading) {
      return address; // Show full address while loading
    }
    
    return formatAddressWithENS(address, resolution?.ensName);
  }, [resolutions]);

  const getResolutionState = useCallback((address: string) => {
    return resolutions[address.toLowerCase()] || {
      ensName: null,
      loading: false,
      error: null,
    };
  }, [resolutions]);

  const getProfile = useCallback((address: string): ENSProfile | null => {
    return profiles[address.toLowerCase()] || null;
  }, [profiles]);

  return {
    resolveAddress,
    resolveProfile,
    resolveMultiple,
    resolveMultipleProfiles,
    getDisplayName,
    getResolutionState,
    getProfile,
    resolutions,
    profiles,
  };
}

export function useENSName(address: string | null) {
  const { resolveAddress, getDisplayName, getResolutionState } = useENSResolver();
  
  useEffect(() => {
    if (address) {
      resolveAddress(address);
    }
  }, [address, resolveAddress]);

  if (!address) {
    return {
      displayName: '',
      ensName: null,
      loading: false,
      error: null,
    };
  }

  const state = getResolutionState(address);
  
  return {
    displayName: getDisplayName(address),
    ensName: state.ensName,
    loading: state.loading,
    error: state.error,
  };
}

export function useENSProfile(address: string | null) {
  const { resolveProfile, getProfile } = useENSResolver();
  
  useEffect(() => {
    if (address) {
      resolveProfile(address);
    }
  }, [address, resolveProfile]);

  if (!address) {
    return {
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
      error: null,
    };
  }

  return getProfile(address) || {
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
} 