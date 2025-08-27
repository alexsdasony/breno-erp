// Type declarations for Deno edge runtime

declare namespace Deno {
  export namespace env {
    export function get(key: string): string | undefined;
  }
}

declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export function createClient(url: string, key: string): any;
}

// Global types for edge runtime
declare global {
  const Deno: {
    env: {
      get(key: string): string | undefined;
    };
  };
}

export {};