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

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vehicleType = searchParams.get('vehicletype') || '';
    const vehicle = searchParams.get('vehicle');
    const problem = searchParams.get('problem');

    if (!vehicle || !problem) {
        return new Response(JSON.stringify({ error: 'Faltan parámetros vehicle o problem' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key no configurada' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    try {
        const queryEspecifica = `${vehicle} ${problem}`.trim();
        const queryGeneral = `${problem} ${vehicleType}`.trim();

        const fetchYouTube = async (query: string, maxResults: number) => {
            if (!query) return [];
            try {
                const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
                const res = await fetch(url);
                if (!res.ok) return [];
                const data = await res.json();
                return data.items || [];
            } catch (e) {
                return [];
            }
        };

        let videosEspecificos = [];
        let videosGenerales = [];

        const [resEspecificos, resGenerales] = await Promise.all([
            fetchYouTube(queryEspecifica, 30),
            fetchYouTube(queryGeneral, 50)
        ]);

        videosEspecificos = resEspecificos;
        videosGenerales = resGenerales;

        const todosLosVideos = [...videosEspecificos, ...videosGenerales];
        const videosUnicos: any[] = [];
        const idsVistos = new Set();

        for (const video of todosLosVideos) {
            const videoId = video.id?.videoId;
            if (!videoId) continue;

            if (!idsVistos.has(videoId)) {
                idsVistos.add(videoId);
                videosUnicos.push({
                    id: videoId,
                    title: video.snippet?.title?.replace(/&quot;/g, '"').replace(/&#39;/g, "'") || '',
                    views: "Nuevo tutorial",
                    image: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || '',
                    lang: "Vídeo Externo",
                    url: `https://www.youtube.com/watch?v=${videoId}`
                });
            }

            if (videosUnicos.length === 50) break;
        }

        if (videosUnicos.length === 0) {
            return new Response(JSON.stringify([
                {
                    id: "mock1",
                    title: `Ver tutoriales de ${vehicle} ${problem} en YouTube`,
                    views: "Búsqueda web",
                    image: "https://images.unsplash.com/photo-1590650046522-86107297eefb?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${vehicle} ${problem}`)}`
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

        return new Response(JSON.stringify(videosUnicos), {
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
