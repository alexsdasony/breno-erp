export const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  // Inclui x-user-token para permitir o header customizado enviado pelo frontend
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

export function ok(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), { headers: corsHeaders, status: 200, ...init });
}

export function badRequest(message: string, init: ResponseInit = {}) {
  return new Response(JSON.stringify({ error: message }), { headers: corsHeaders, status: 400, ...init });
}

export function notFound(message = 'Not found', init: ResponseInit = {}) {
  return new Response(JSON.stringify({ error: message }), { headers: corsHeaders, status: 404, ...init });
}

export function serverError(message = 'Internal server error', init: ResponseInit = {}) {
  return new Response(JSON.stringify({ error: message }), { headers: corsHeaders, status: 500, ...init });
}


