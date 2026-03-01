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
    const vehicle = searchParams.get('vehicle');
    const problem = searchParams.get('problem');

    if (!vehicle || !problem) {
        return new Response(JSON.stringify({ error: 'Faltan los parámetros vehicle o problem' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'API Key no configurada en el servidor local' }), {
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

        // Construir 3 queries distintas para máxima cobertura
        const query1 = `${vehicle} ${problem}`; // Exacta: Vehículo y Problema
        const query2 = `cómo arreglar ${problem}`; // Genérica: Solo problema
        const query3 = `${vehicle} repair diagnosis tutorial`; // Genérica: Solo vehículo

        const getUrl = (q: string, max: number) =>
            `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${max}&q=${encodeURIComponent(q)}&type=video&key=${apiKey}`;

        // Hacemos las 3 peticiones en paralelo
        const [res1, res2, res3] = await Promise.allSettled([
            fetch(getUrl(query1, 20)),
            fetch(getUrl(query2, 20)),
            fetch(getUrl(query3, 20))
        ]);

        if (res1.status === 'fulfilled' && res1.value.ok) {
            const data1 = await res1.value.json();
            processItems(data1.items);
        }

        if (res2.status === 'fulfilled' && res2.value.ok) {
            const data2 = await res2.value.json();
            processItems(data2.items);
        }

        if (res3.status === 'fulfilled' && res3.value.ok) {
            const data3 = await res3.value.json();
            processItems(data3.items);
        }

        let results = Array.from(uniqueVideos.values());

        // Truncar a un máximo de 50 si nos pasamos
        if (results.length > 50) {
            results = results.slice(0, 50);
        }

        // Si no hay resultados por problemas de API
        if (results.length === 0) {
            throw new Error("No se devolvió ningún resultado (Posible límite de cuota superado)");
        }

        return new Response(JSON.stringify(results), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        console.error('Error conectando con YouTube:', error);
        return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
