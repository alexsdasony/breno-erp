import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3001/api/:path*' 
          : `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
      {
        source: '/functions/:path*',
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/:path*`,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };
    return config;
  },
};

export default nextConfig;
