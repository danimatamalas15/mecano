export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const tipo = searchParams.get('tipo') || 'Mecánica';

    if (!lat || !lng) {
        return Response.json({ error: 'Faltan coordenadas' }, { status: 400 });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return Response.json({ error: 'API Key de Google Maps no configurada en el backend' }, { status: 500 });
    }

    let keyword = 'taller mecanico';
    if (tipo === 'Chapa') keyword = 'taller chapa y pintura';
    else if (tipo === 'Electrónica') keyword = 'taller electricidad automovil';
    else if (tipo === 'Neumáticos') keyword = 'taller neumaticos';

    // Usamos rankby=distance y eliminamos "radius" según la documentación de Google para priorizar la proximidad estricta.
    const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=car_repair&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();
        return Response.json(data.results || []);
    } catch (error) {
        return Response.json({ error: 'Error al contactar con Google Maps' }, { status: 500 });
    }
}
