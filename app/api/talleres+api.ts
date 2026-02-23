export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const tipo = searchParams.get('tipo') || 'Mecánica';

    if (!lat || !lng) {
        return new Response(JSON.stringify({ error: 'Faltan coordenadas' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key de Google Maps no configurada en el backend' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    let keyword = 'mecanico';
    if (tipo === 'Chapa') keyword = 'chapa y pintura';
    else if (tipo === 'Electrónica') keyword = 'electricidad automovil';
    else if (tipo === 'Neumáticos') keyword = 'neumaticos';

    const radio = 8000; // Aumentamos radio a 8km para islas o zonas menos densas

    // Al usar type=car_repair o car_dealer, algunas veces choca restrictivamente con el keyword en español.
    // Usamos el textsearch o keyword amplio para priorizar la coincidencia.
    const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radio}&keyword=${encodeURIComponent('taller ' + keyword)}&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();

        return new Response(JSON.stringify(data.results || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error al contactar con Google Maps', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
