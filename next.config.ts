import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ovluplweospdirelbzas.supabase.co",
        pathname: "/storage/v1/object/public/content-images/**",
      },
      {
        protocol: "https",
        hostname: "ovluplweospdirelbzas.supabase.co",
        pathname: "/storage/v1/object/public/product-images/**",
      },
      {
        protocol: "https",
        hostname: "ovluplweospdirelbzas.supabase.co",
        pathname: "/storage/v1/object/public/brand-logos/**",
      },
    ],
  },
  // Exclude Supabase functions from compilation
  webpack: (config) => {
    // Exclude supabase functions directory from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/supabase/functions/**']
    };
    
    return config;
  },
  
  // TypeScript will respect the exclude in tsconfig.json
  // This will catch errors in your Next.js code but ignore supabase/functions
  typescript: {
    ignoreBuildErrors: false, // Still catches ALL errors in included files
  },
};

export default nextConfig;
