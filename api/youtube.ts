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

    const googleUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=30&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;

    try {
        const response = await fetch(googleUrl);
        const data = await response.json();

        if (!response.ok) {
            console.warn(`YouTube API falló: ${data.error?.message || response.statusText}`);
            return new Response(JSON.stringify([
                {
                    id: "mock1",
                    title: `Tutorial paso a paso: ${query}`,
                    views: "15K vistas",
                    image: "https://images.unsplash.com/photo-1590650046522-86107297eefb?q=80&w=300",
                    lang: "Español",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
                },
                {
                    id: "mock2",
                    title: `Cómo arreglar o cambiar en tu coche/moto`,
                    views: "8K vistas",
                    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=300",
                    lang: "Español",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
                }
            ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        if (!data.items || data.items.length === 0) {
            return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // Evitar duplicados basados en ID
        const uniqueVideos = new Map();

        data.items.forEach((item: any) => {
            if (!uniqueVideos.has(item.id.videoId)) {
                uniqueVideos.set(item.id.videoId, {
                    id: item.id.videoId,
                    title: item.snippet.title.replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
                    views: "Nuevo",
                    image: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                    lang: "Vídeo Externo",
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}`
                });
            }
        });

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
