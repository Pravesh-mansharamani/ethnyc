import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    ppr: true,
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'euc.li',
      },
      {
        hostname: 'metadata.ens.domains',
      },
      {
        hostname: 'api.ens.domains',
      },
      {
        hostname: 'res.cloudinary.com',
      },
      {
        hostname: 'ipfs.io',
      },
      {
        hostname: 'gateway.pinata.cloud',
      },
      {
        hostname: 'dweb.link',
      },
      {
        hostname: 'arweave.net',
      },
      {
        hostname: 'ipfs.infura.io',
      },
      {
        hostname: 'ipfs.run',
      },
      {
        hostname: 'ipfs.eternum.io',
      },
      {
        hostname: '4everland.io',
      },
      {
        hostname: 'w3s.link',
      },
      {
        hostname: 'cf-ipfs.com',
      },
      {
        hostname: 'avatars.dicebear.com',
      },
      {
        hostname: 'api.dicebear.com',
      },
      {
        hostname: 'robohash.org',
      },
      {
        hostname: 'ui-avatars.com',
      },

    ],
    // Add image optimization settings for better ENS avatar handling
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
