console.log('Testing environment variables:');
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0);
console.log('NODE_ENV:', process.env.NODE_ENV);
