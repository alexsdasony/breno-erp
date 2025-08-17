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
    
    // Se estiver usando banco local, não fazer proxy
    if (process.env.USE_LOCAL_DATABASE === 'true') {
      console.log('🔧 Modo local: sem proxy de API');
      return rewrites;
    }
    
    // Rewrite para API externa (Edge Functions) em desenvolvimento e produção
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
