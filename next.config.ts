import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Phone/LAN access in dev (e.g. http://192.168.1.159:3000).
  allowedDevOrigins: ['192.168.1.159'],
};

export default nextConfig;
