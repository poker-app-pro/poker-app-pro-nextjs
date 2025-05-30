/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,
  
  // Configure module resolution for CLEAN architecture
  webpack: (config, { isServer }) => {
    // Ensure proper resolution of src/ directory modules
    config.resolve.modules.push('./src');
    
    return config;
  },
}

module.exports = nextConfig
