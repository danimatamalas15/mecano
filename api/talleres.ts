export const config = {
    runtime: 'edge',
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

export default async function handler(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const tipo = searchParams.get('tipo') || 'Mecánica';

    if (!lat || !lng) {
        return new Response(JSON.stringify({ error: 'Faltan coordenadas' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key de Google Maps no configurada en el backend' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    let keyword = 'mecanico';
    if (tipo === 'Chapa') keyword = 'chapa y pintura';
    else if (tipo === 'Electrónica') keyword = 'electricidad automovil';
    else if (tipo === 'Neumáticos') keyword = 'neumaticos';

    const radio = 8000;

    const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radio}&keyword=${encodeURIComponent('taller ' + keyword)}&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            return new Response(JSON.stringify({ error: `Google Places API status: ${data.status}`, details: data.error_message || '' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        return new Response(JSON.stringify(data.results || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al contactar con Google Maps', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
