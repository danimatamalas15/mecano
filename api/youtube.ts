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
    const query = searchParams.get('q');

    if (!query) {
        return new Response(JSON.stringify({ error: 'Falta el parámetro q (query)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key no configurada en el servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    try {
        const uniqueVideos = new Map();

        // Función helper para procesar items
        const processItems = (items: any[]) => {
            if (!items) return;
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

        // Primera petición (Query original)
        const googleUrlPrimary = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        const responsePrimary = await fetch(googleUrlPrimary);
        const dataPrimary = await responsePrimary.json();

        if (!responsePrimary.ok) {
            console.warn(`YouTube API falló en petición primaria: ${dataPrimary.error?.message || responsePrimary.statusText}`);
            return new Response(JSON.stringify([
                {
                    id: "mock1",
                    title: `Tutorial paso a paso: ${query}`,
                    views: "Búsqueda web",
                    image: "https://images.unsplash.com/photo-1590650046522-86107297eefb?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
                },
                {
                    id: "mock2",
                    title: `Cómo diagnosticar / reparar este problema`,
                    views: "Búsqueda general",
                    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`
                }
            ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        processItems(dataPrimary.items);

        // Si tenemos pocos resultados (< 30), intentamos una segunda petición ampliando con términos en inglés
        if (uniqueVideos.size < 30) {
            const englishQuery = query.replace(/diagn[oó]stico/i, 'diagnosis')
                .replace(/reparaci[oó]n/i, 'repair')
                + ' fix tutorial mechanism';

            const googleUrlSecondary = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&q=${encodeURIComponent(englishQuery)}&type=video&key=${apiKey}`;
            const responseSecondary = await fetch(googleUrlSecondary);

            if (responseSecondary.ok) {
                const dataSecondary = await responseSecondary.json();
                processItems(dataSecondary.items);
            }
        }

        const results = Array.from(uniqueVideos.values());

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        console.error('Error interno conectando con YouTube:', error);
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
