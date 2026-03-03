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

        // Limpiar cualquier comilla doble que el usuario haya podido introducir
        const safeVehicle = vehicle.replace(/"/g, '').trim();
        const safeProblem = problem.replace(/"/g, '').trim();

        // Extraer el motor del string "Marca - Modelo - Versión - Motor - Año"
        let motor = safeVehicle;
        const parts = safeVehicle.split('-');
        if (parts.length >= 4) {
            // Si el formato es con guiones, el 4to elemento (índice 3) suele ser el motor
            motor = parts[3].trim();
        } else {
            // Intento heurístico separando por espacios
            const words = safeVehicle.split(' ');
            if (words.length > 2) {
                // Eliminamos la primera palabra (Marca) y la última si es un número (Año)
                if (!isNaN(Number(words[words.length - 1]))) {
                    words.pop();
                }
                words.shift();
                motor = words.join(' ');
            }
        }

        // --- Definición de Queries Prioritarias ---
        // 1. Marca - Modelo - Versión - Motor - Año + Descripción
        const q1 = `${safeVehicle} ${safeProblem}`.trim();

        // 2. Motor + Descripción (ignorando Marca, Modelo, Versión y Año)
        const q2 = `${motor} ${safeProblem}`.trim();

        // 3. Resto de videos (Descripción únicamente)
        const q3 = `${safeProblem}`.trim();

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

        // Pedimos 50 a cada una para garantizar llenar el cupo si alguna falla o trae repetidos
        const [items1, items2, items3] = await Promise.all([
            fetchSafe(getUrl(q1, 50)),
            fetchSafe(getUrl(q2, 50)),
            fetchSafe(getUrl(q3, 50))
        ]);

        // Procesar estrictamente en orden:
        // Primero prioridad 1
        processItems(items1 || []);
        // Luego prioridad 2 (solo agregará si no son duplicados por ID)
        processItems(items2 || []);
        // Finalmente prioridad 3 (solo agregará si no son duplicados por ID)
        processItems(items3 || []);

        let results = Array.from(uniqueVideos.values());

        if (results.length === 0) {
            return new Response(JSON.stringify([
                {
                    id: "mock1",
                    title: `Ver tutoriales de ${safeVehicle} ${safeProblem} en YouTube`,
                    views: "Búsqueda web",
                    image: "https://images.unsplash.com/photo-1590650046522-86107297eefb?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(safeVehicle + ' ' + safeProblem)}`
                },
                {
                    id: "mock2",
                    title: `Tutoriales genéricos sobre este problema`,
                    views: "Búsqueda web",
                    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=300",
                    lang: "Auto",
                    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(safeProblem)}`
                }
            ]), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        // Dejar EXACATAMENTE 50 videos si hay más
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
