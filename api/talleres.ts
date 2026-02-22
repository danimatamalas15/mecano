export const config = {
    runtime: 'edge',
};

export default async function handler(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const tipo = searchParams.get('tipo') || 'Mecánica';

    if (!lat || !lng) {
        return new Response(JSON.stringify({ error: 'Faltan coordenadas' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key de Google Maps no configurada en el backend' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    let keyword = 'taller mecanico';
    if (tipo === 'Chapa') keyword = 'taller chapa y pintura';
    else if (tipo === 'Electrónica') keyword = 'taller electricidad automovil';
    else if (tipo === 'Neumáticos') keyword = 'taller neumaticos';

    const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=car_repair&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data.results || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al contactar con Google Maps', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
}
