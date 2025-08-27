import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  output: 'standalone',
  
  // Ignorar erros de ESLint durante o build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configuração para garantir que as variáveis de ambiente sejam aplicadas
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
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
    
    // Rewrite para Supabase Edge Functions
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (apiUrl) {
      rewrites.push({
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      });
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
