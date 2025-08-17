'use client';

import React from 'react';
import { ENSEnhancedText, NFTOwnerDisplay } from './ens-enhanced-text';

const ENSDemo: React.FC = () => {
  // Some well-known addresses with ENS names for testing
  const testText = `
Here are some wallet addresses that should resolve to clean ENS names:

Vitalik Buterin: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
idk : 0x7eb413211a9de1cd2fe8b8bb6055636c43f7d206

Pravesh: 0x674CA194b1676918AfFC538C162d35BA726aaf94

And here's a regular address without ENS: 0x742d35Cc6634C0532925a3b8D4024f8D2d3c0000

Click on any ENS name to see their full profile on the ENS app.
  `;

  const nftOwnerAddresses = [
    '0x7eb413211a9de1cd2fe8b8bb6055636c43f7d206', // vitalik.eth
    '0x0b1302c23d9EB4B42A74cbefc4f9b3081ff1bf18', // nader.eth
    '0x674CA194b1676918AfFC538C162d35BA726aaf94', // pravesh.eth (if exists)
    '0x742d35Cc6634C0532925a3b8D4024f8D2d3c0000', // regular address
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">ENS Integration Demo</h1>
        <p className="text-muted-foreground mb-8">
          Clean, minimal ENS name resolution with shadcn/ui styling
        </p>
        
        {/* Basic ENS Resolution */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Basic ENS Resolution</h2>
          <div className="rounded-lg border bg-card p-6">
            <ENSEnhancedText showFullProfiles={false}>
              {testText}
            </ENSEnhancedText>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Basic mode: Shows ENS names as clickable links, or full addresses if no ENS name exists.
          </p>
        </div>

        {/* Clean Profile Mode */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Clean Profile Mode</h2>
          <div className="rounded-lg border bg-card p-6">
            <ENSEnhancedText showFullProfiles={true} autoResolveProfiles={true}>
              {testText}
            </ENSEnhancedText>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Profile mode: Shows avatar + ENS name in clean pills, or full address if no ENS name.
          </p>
        </div>

        {/* NFT Owner Display Component */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">NFT Owner Display</h2>
          <p className="text-muted-foreground mb-4">
            Perfect for showing NFT owners in search results:
          </p>
          <div className="space-y-3">
            {nftOwnerAddresses.map((address, index) => (
              <div key={address} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-medium">
                    Owner #{index + 1}:
                  </span>
                  <NFTOwnerDisplay address={address} />
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  NFT Owner
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Examples */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Chatbot Integration Examples</h2>
          <div className="grid gap-4">
            <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🤖</span>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  NFT Search Results
                </h3>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                "Show me who owns Bored Ape #1234"
              </p>
              <div className="rounded border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Bored Ape Yacht Club #1234 is owned by:
                </p>
                <NFTOwnerDisplay address="0x7eb413211a9de1cd2fe8b8bb6055636c43f7d206" />
              </div>
            </div>

            <div className="rounded-lg border bg-green-50/50 dark:bg-green-950/20 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💬</span>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Address in Chat
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                User: "Check this address: 0x7eb413211a9de1cd2fe8b8bb6055636c43f7d206"
              </p>
              <div className="rounded border bg-card p-4">
                <ENSEnhancedText showFullProfiles={true}>
                  I found information about this address: 0x7eb413211a9de1cd2fe8b8bb6055636c43f7d206
                </ENSEnhancedText>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="rounded-lg border bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20 p-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-900 dark:text-purple-100">
            ✨ Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
              </div>
              <span className="text-sm">Clean avatar + name display</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
              </div>
              <span className="text-sm">Clickable for full ENS profiles</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
              </div>
              <span className="text-sm">shadcn/ui consistent styling</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
              </div>
              <span className="text-sm">Automatic address detection</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
              </div>
              <span className="text-sm">Multi-chain ENS support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
              </div>
              <span className="text-sm">OpenSea integration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ENSDemo; 