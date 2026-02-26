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
            return new Response(JSON.stringify({ error: `YouTube API falló: ${data.error?.message || response.statusText}` }), {
                status: response.status,
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
        return new Response(JSON.stringify({ error: 'Error interno conectando con YouTube', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
