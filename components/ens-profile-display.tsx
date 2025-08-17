'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ENSProfileDisplayProps {
  profile: {
    name?: string | null;
    avatar?: string | null;
    description?: string | null;
    email?: string | null;
    url?: string | null;
    twitter?: string | null;
    github?: string | null;
    discord?: string | null;
    telegram?: string | null;
  };
  address?: string;
  className?: string;
  compact?: boolean;
}

export const ENSProfileDisplay: React.FC<ENSProfileDisplayProps> = ({
  profile,
  address,
  className,
  compact = false,
}) => {
  if (!profile.name) {
    return null;
  }

  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-card hover:bg-accent border border-border",
        "transition-colors duration-200",
        className
      )}>
        {profile.avatar && (
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
        )}
        <Link 
          href={`https://app.ens.domains/${profile.name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
        >
          {profile.name}
        </Link>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-6 rounded-lg border bg-card space-y-4",
      className
    )}>
      {/* Header with avatar and name */}
      <div className="flex items-center gap-4">
        {profile.avatar && (
          <Image 
            src={profile.avatar} 
            alt={`${profile.name} avatar`}
            width={64}
            height={64}
            className="rounded-full object-cover border-2 border-green-200 dark:border-green-800"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href={`https://app.ens.domains/${profile.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl font-bold text-green-600 dark:text-green-400 hover:underline"
            >
              {profile.name}
            </Link>
            <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
              ENS
            </span>
          </div>
          {address && (
            <p className="text-sm text-muted-foreground font-mono break-all">
              {address}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {profile.description && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            About
          </h4>
          <p className="text-sm leading-relaxed">
            {profile.description}
          </p>
        </div>
      )}

      {/* Social Links */}
      {(profile.twitter || profile.github || profile.url || profile.email) && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Links
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.twitter && (
              <Link 
                href={`https://twitter.com/${profile.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors text-sm"
              >
                <span>🐦</span>
                <span>@{profile.twitter}</span>
              </Link>
            )}
            {profile.github && (
              <Link 
                href={`https://github.com/${profile.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                <span>🐙</span>
                <span>{profile.github}</span>
              </Link>
            )}
            {profile.url && (
              <Link 
                href={profile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors text-sm"
              >
                <span>🌐</span>
                <span>Website</span>
              </Link>
            )}
            {profile.email && (
              <Link 
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900 transition-colors text-sm"
              >
                <span>📧</span>
                <span>Email</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Additional social links */}
      {(profile.discord || profile.telegram) && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Social
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.discord && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-sm">
                <span>💬</span>
                <span>{profile.discord}</span>
              </div>
            )}
            {profile.telegram && (
              <Link 
                href={`https://t.me/${profile.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors text-sm"
              >
                <span>✈️</span>
                <span>@{profile.telegram}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ENSProfileDisplay; 