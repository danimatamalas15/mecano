export default async function handler(req: any, res: any) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const vehicle = req.query.vehicle;
    const problem = req.query.problem;

    if (!vehicle || !problem) {
        return res.status(400).json({ error: 'Faltan parámetros vehicle o problem' });
    }

    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key no configurada' });
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
        const safeVehicle = String(vehicle).replace(/"/g, '').trim();
        const safeProblem = String(problem).replace(/"/g, '').trim();

        // 1. Los que hagan referencia a la marca, modelo y tipo indicado por el usuario teniendo en cuenta la descripción del problema.
        const q1 = `${safeVehicle} ${safeProblem}`.trim();

        // 2. Los que hagan referencia a la descripción del problema, aunque no sean de la marca y modelo del vehículo indicado por el usuario.
        const q2 = `${safeProblem}`.trim();

        // 3. El resto de videos relacionados hasta llegar a los 50 videos en total.
        const q3 = `cómo solucionar reparar ${safeProblem}`.trim();

        const fetchSafe = async (url: string) => {
            try {
                const resHttp = await fetch(url);
                if (!resHttp.ok) {
                    const errData = await resHttp.json().catch(() => ({}));
                    console.error("Error en YouTube API:", resHttp.status, errData);
                    return null;
                }
                const data = await resHttp.json();
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
            return res.status(200).json([
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
            ]);
        }

        if (results.length > 50) {
            results = results.slice(0, 50);
        }

        return res.status(200).json(results);

    } catch (error) {
        console.error('Error conectando con YouTube:', error);
        return res.status(500).json({ error: String(error) });
    }
}
