import React, { useMemo, useEffect } from 'react';
import { useENSResolver } from '@/hooks/use-ens-resolver';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

// Regex to match Ethereum addresses (0x followed by 40 hex characters)
const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g;

interface AddressSpanProps {
  address: string;
  getDisplayName: (address: string) => string;
  getResolutionState: (address: string) => {
    ensName: string | null;
    loading: boolean;
    error: string | null;
  };
  getProfile: (address: string) => any;
  showProfile?: boolean;
}

const AddressSpan: React.FC<AddressSpanProps> = ({ 
  address, 
  getDisplayName, 
  getResolutionState,
  getProfile,
  showProfile = true 
}) => {
  const displayName = getDisplayName(address);
  const state = getResolutionState(address);
  const profile = getProfile(address);
  
  const hasProfile = profile && profile.name;
  const avatar = profile?.avatar;

  if (showProfile && hasProfile) {
    return (
      <Link 
        href={`https://app.ens.domains/${profile.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900",
          "border border-green-200 dark:border-green-800",
          "transition-colors duration-200",
          "text-green-700 dark:text-green-300",
          "hover:text-green-800 dark:hover:text-green-200",
          "no-underline hover:no-underline"
        )}
      >
        {avatar ? (
          <Image 
            src={avatar} 
            alt={`${profile.name} avatar`}
            width={20}
            height={20}
            className="rounded-full object-cover border border-green-300 dark:border-green-700"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="size-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
            <span className="text-xs text-green-600 dark:text-green-400">👤</span>
          </div>
        )}
        <span className="text-sm font-medium">
          {profile.name}
        </span>
      </Link>
    );
  }
  
  return (
    <span 
      className={cn(
        "inline-block px-2 py-1 rounded-md text-sm font-mono transition-colors",
        state.ensName 
          ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800" 
          : "bg-muted text-muted-foreground border border-border",
        state.loading && "animate-pulse"
      )}
      title={state.ensName ? `${state.ensName} (${address})` : address}
    >
      {state.ensName ? (
        <Link 
          href={`https://app.ens.domains/${state.ensName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 no-underline hover:underline"
        >
          {displayName}
        </Link>
      ) : (
        displayName
      )}
    </span>
  );
};

interface ENSEnhancedTextProps {
  children: string;
  className?: string;
  showFullProfiles?: boolean;
  autoResolveProfiles?: boolean;
}

export const ENSEnhancedText: React.FC<ENSEnhancedTextProps> = ({ 
  children, 
  className,
  showFullProfiles = false,
  autoResolveProfiles = true
}) => {
  const { resolveMultiple, resolveMultipleProfiles, getDisplayName, getResolutionState, getProfile } = useENSResolver();
  
  // Extract all Ethereum addresses from the text
  const addresses = useMemo(() => {
    const matches = children.match(ETH_ADDRESS_REGEX);
    return matches ? Array.from(new Set(matches)) : [];
  }, [children]);

  // Trigger resolution for all found addresses
  useEffect(() => {
    if (addresses.length > 0) {
      if (autoResolveProfiles && showFullProfiles) {
        resolveMultipleProfiles(addresses);
      } else {
        resolveMultiple(addresses);
      }
    }
  }, [addresses, resolveMultiple, resolveMultipleProfiles, autoResolveProfiles, showFullProfiles]);

  // Split text and replace addresses with components
  const enhancedContent = useMemo(() => {
    if (addresses.length === 0) {
      return children;
    }

    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    let keyCounter = 0;

    // Create a combined regex for all addresses
    const combinedRegex = new RegExp(ETH_ADDRESS_REGEX.source, 'g');
    let match;

    while ((match = combinedRegex.exec(children)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(children.slice(lastIndex, match.index));
      }

      // Add the address component
      parts.push(
        <AddressSpan
          key={`address-${keyCounter++}`}
          address={match[0]}
          getDisplayName={getDisplayName}
          getResolutionState={getResolutionState}
          getProfile={getProfile}
          showProfile={showFullProfiles}
        />
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < children.length) {
      parts.push(children.slice(lastIndex));
    }

    return parts;
  }, [children, addresses, getDisplayName, getResolutionState, getProfile, showFullProfiles]);

  return (
    <span className={className}>
      {enhancedContent}
    </span>
  );
};

// Component specifically for displaying NFT owner information with ENS
export const NFTOwnerDisplay: React.FC<{
  address: string;
  className?: string;
}> = ({ address, className }) => {
  const { resolveProfile, getProfile } = useENSResolver();
  
  useEffect(() => {
    if (address) {
      resolveProfile(address);
    }
  }, [address, resolveProfile]);

  const profile = getProfile(address);
  const hasProfile = profile && profile.name;

  if (profile?.loading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-6 h-6 bg-muted animate-pulse rounded-full"></div>
        <div className="h-4 bg-muted animate-pulse rounded w-20"></div>
      </div>
    );
  }

  if (hasProfile) {
    return (
      <Link 
        href={`https://app.ens.domains/${profile.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
          "bg-card hover:bg-accent border border-border",
          "transition-colors duration-200",
          "text-card-foreground hover:text-accent-foreground",
          "no-underline hover:no-underline",
          className
        )}
      >
        {profile.avatar ? (
          <Image 
            src={profile.avatar} 
            alt={`${profile.name} avatar`}
            width={24}
            height={24}
            className="rounded-full object-cover border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="size-6 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">👤</span>
          </div>
        )}
        <span className="text-sm font-medium">
          {profile.name}
        </span>
      </Link>
    );
  }

      return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-muted border border-border",
        "text-muted-foreground",
        className
      )}>
        <div className="size-6 rounded-full bg-muted-foreground/20 flex items-center justify-center">
          <span className="text-xs">👤</span>
        </div>
        <span className="text-sm font-mono break-all">
          {address}
        </span>
      </div>
    );
};

export default ENSEnhancedText; 