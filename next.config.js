import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Configurações específicas para Vercel
  serverExternalPackages: ['@/hooks/useAppData'],
  // Desabilitar SSR para páginas que usam useAppData
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ];
  },
  async rewrites() {
    const rewrites = [];
    
    // Rewrite para API local em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      rewrites.push({
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      });
    } else {
      // Rewrite para API externa em produção
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        rewrites.push({
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        });
      }
    }
    
    // Rewrite para Supabase Functions
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      rewrites.push({
        source: '/functions/:path*',
        destination: `${supabaseUrl}/functions/:path*`,
      });
    }
    
    return rewrites;
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
