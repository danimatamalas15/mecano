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
    try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const url = `${baseUrl}/api/youtube?q=${encodeURIComponent(query)}`;
        const response = await fetch(url);

        if (!response.ok) {
            let errorMsg = `HTTP ${response.status}`;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorMsg;
            } catch (e) { }
            throw new Error(errorMsg);
        }

        const videos = await response.json();
        return Array.isArray(videos) ? videos : [];

    } catch (error: any) {
        console.error("Fallo obteniendo YouTube Videos:", error);

        // Renderizar el error visiblemente como un "video" falso para depurar en Vercel
        return [{
            id: "error-debug",
            title: `[ERROR DEBUG] ${error.message || String(error)}`,
            views: "ERROR",
            image: "https://images.unsplash.com/photo-1594322436404-5a0526db4d13?q=80&w=200",
            lang: "DEBUG",
            url: "#"
        }];
    }
};
