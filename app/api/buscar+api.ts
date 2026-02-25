const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS(request: Request) {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vehiculo = searchParams.get('vehiculo');
    const repuesto = searchParams.get('repuesto');
    const herramienta = searchParams.get('herramienta');

    let query = '';

    if (vehiculo && repuesto) {
        query = `comprar ${repuesto} para ${vehiculo}`;
    } else if (herramienta) {
        query = `comprar herramienta ${herramienta}`;
    } else {
        return new Response(JSON.stringify({ error: 'Faltan parámetros de búsqueda válidos (vehiculo/repuesto, o herramienta)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    const cx = process.env.GOOGLE_CX || process.env.EXPO_PUBLIC_GOOGLE_CX;

    if (!apiKey || !cx) {
        return new Response(JSON.stringify({ error: 'Falta configurar API Key (EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY) o GOOGLE_CX en el servidor local' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return new Response(JSON.stringify({ error: `Google CX API falló: ${data.error?.message || response.statusText}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error interno conectando con Google Search local', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
