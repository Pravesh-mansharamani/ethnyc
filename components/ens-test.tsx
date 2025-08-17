'use client';

import React from 'react';
import { ENSEnhancedText } from './ens-enhanced-text';

const ENSTest: React.FC = () => {
  // Test addresses including shaq.eth
  const testAddresses = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // vitalik.eth
    '0x3C6aEFF92b4B35C2e1b196B57d0f8FFB56884A17', // shaq.eth
    '0x004cc3223e842d9d2af6b8ca93a4d40838e85462', // Unknown - should show full address
    '0x9469e735102346f7ec97de87cac50751d8a3d709c', // D1VFII
  ];

  const testENSNames = [
    'vitalik.eth',
    'shaq.eth', 
    'nick.eth',
    'brantly.eth',
  ];

  const testText = `
Testing ENS resolution with known addresses and names:

Addresses:
1. Vitalik: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
2. Shaq: 0x3C6aEFF92b4B35C2e1b196B57d0f8FFB56884A17
3. Unknown: 0x004cc3223e842d9d2af6b8ca93a4d40838e85462

ENS Names:
1. vitalik.eth
2. shaq.eth  
3. nick.eth

These should resolve to show avatars, social links, and profile information.
`;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Enhanced ENS Resolution Test</h1>
        <p className="text-muted-foreground mb-8">
          Testing with shaq.eth and other known ENS profiles
        </p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Automatic Text Processing</h2>
          <div className="rounded-lg border bg-card p-6">
            <ENSEnhancedText showFullProfiles={true} autoResolveProfiles={true}>
              {testText}
            </ENSEnhancedText>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Individual Address Testing</h2>
          <div className="space-y-4">
            {testAddresses.map((address, index) => (
              <div key={address} className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mb-2">Address #{index + 1}:</p>
                <ENSEnhancedText showFullProfiles={true} autoResolveProfiles={true}>
                  {address}
                </ENSEnhancedText>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">ENS Names Testing</h2>
          <div className="space-y-4">
            {testENSNames.map((ensName, index) => (
              <div key={ensName} className="p-4 rounded-lg border bg-card">
                <p className="text-sm text-muted-foreground mb-2">ENS #{index + 1}:</p>
                <ENSEnhancedText showFullProfiles={true} autoResolveProfiles={true}>
                  {ensName}
                </ENSEnhancedText>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🔍 Enhanced Debug Information
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>shaq.eth</strong> should show avatar and Twitter (@shaq)</li>
            <li>• <strong>vitalik.eth</strong> should show full profile with social links</li>
            <li>• Multiple RPC endpoints are tried for better reliability</li>
            <li>• Both &quot;com.twitter&quot; and &quot;twitter&quot; keys are checked</li>
            <li>• If addresses don&apos;t resolve, they&apos;ll show in full (no truncation)</li>
            <li>• The system caches results for better performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ENSTest; 