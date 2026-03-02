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
    const vehicle = searchParams.get('vehicle');
    const problem = searchParams.get('problem');

    if (!vehicle || !problem) {
        return new Response(JSON.stringify({ error: 'Faltan parámetros vehicle o problem' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key no configurada' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    try {
        const uniqueVideos = new Map();

        const processItems = (items: any[]) => {
            if (!items || !Array.isArray(items)) return;
            items.forEach((item: any) => {
                const videoId = item.id?.videoId;
                if (videoId && !uniqueVideos.has(videoId)) {
                    uniqueVideos.set(videoId, {
                        id: videoId,
                        title: item.snippet?.title?.replace(/&quot;/g, '"').replace(/&#39;/g, "'") || '',
                        views: "Nuevo tutorial",
                        image: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
                        lang: "Vídeo Externo",
                        url: `https://www.youtube.com/watch?v=${videoId}`
                    });
                }
            });
        };

        const getUrl = (q: string, max: number) =>
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${max}&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`;

        // Limpiar cualquier comilla doble que el usuario haya podido introducir, ya que fuerzan búsqueda exacta en YouTube y dan 0 resultados
        const safeVehicle = vehicle.replace(/"/g, '').trim();
        const safeProblem = problem.replace(/"/g, '').trim();

        // 1. Los que hagan referencia a la marca, modelo y tipo indicado por el usuario teniendo en cuenta la descripción del problema.
        const q1 = `${safeVehicle} ${safeProblem}`.trim();

        // 2. Los que hagan referencia a la descripción del problema, aunque no sean de la marca y modelo del vehículo indicado por el usuario.
        const q2 = `${safeProblem}`.trim();

        // 3. El resto de videos relacionados hasta llegar a los 50 videos en total.
        const q3 = `cómo solucionar reparar ${safeProblem}`.trim();

        const fetchSafe = async (url: string) => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error("Error en YouTube API:", res.status, errData);
                    return null;
                }
                const data = await res.json();
                return data.items || [];
            } catch (e) {
                console.error("Excepción catcheada YouTube Fetch:", e);
                return null;
            }
        };

        const [items1, items2, items3] = await Promise.all([
            fetchSafe(getUrl(q1, 30)),
            fetchSafe(getUrl(q2, 30)),
            fetchSafe(getUrl(q3, 20)) // Pedimos un poco menos del genérico porque los dos primeros suplirán la inmensa mayoría
        ]);

        processItems(items1 || []);
        processItems(items2 || []);
        processItems(items3 || []);

        let results = Array.from(uniqueVideos.values());

        if (results.length === 0) {
            return new Response(JSON.stringify([
                {
                    id: "mock1",
                    title: `Ver tutoriales de ${vehicle} ${problem} en YouTube`,
                    views: "Búsqueda web",
                    image: "https://images.unsplash.com/photo-1590650046522-86107297eefb?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(vehicle + ' ' + problem)}`
                },
                {
                    id: "mock2",
                    title: `Tutoriales genéricos sobre este problema`,
                    views: "Búsqueda web",
                    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(problem!)}`
                }
            ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        if (results.length > 50) {
            results = results.slice(0, 50);
        }

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });

    } catch (error) {
        console.error('Error conectando con YouTube:', error);
        return new Response(JSON.stringify({ error: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
