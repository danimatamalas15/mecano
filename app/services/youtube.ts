export const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

export interface YouTubeVideo {
    id: string;
    title: string;
    views: string; // La API de búsqueda no da views sin otro llamado extra, simularemos el placeholder
    image: string;
    lang: string;
    url: string;
}

export const fetchYouTubeVideos = async (query: string): Promise<YouTubeVideo[]> => {
    const apiKey = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; // Normalmente Maps y YouTube pueden compartir proyecto o no. Lo ideal es una llave para YT.

    // Si no hay API key de google, devolvemos videos simulados para no romper la app
    if (!apiKey) {
        console.warn("Falta EXPO_PUBLIC_YOUTUBE_API_KEY en .env. Devolviendo videos simulados de YouTube.");
        return Array.from({ length: 5 }).map((_, i) => ({
            id: String(i + 1),
            title: `Generando resultados automáticos de YouTube para: ${query.substring(0, 30)}... - Video ${i + 1}`,
            views: `~${Math.floor(Math.random() * 500) + 10}K visualizaciones`,
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200", // Youtube Default placeholder
            lang: "Español",
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        }));
    }

    try {
        const url = `${YOUTUBE_API_URL}?part=snippet&maxResults=30&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error de YouTube API: ${response.status}`);
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) return [];

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

        return Array.from(uniqueVideos.values());

    } catch (error) {
        console.error("Fallo obteniendo YouTube Videos:", error);
        return [];
    }
};
