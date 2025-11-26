/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Configure webpack to handle Edge Runtime compatibility issues with Supabase
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // For client-side, exclude problematic packages from Edge Runtime bundling
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
  // Exclude Supabase packages from server components external packages
  // This helps with Edge Runtime compatibility
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js', '@supabase/realtime-js'],
  },
}

module.exports = nextConfig
