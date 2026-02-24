export const YOUTUBE_API_URL = "https://www.googleapis.com/youtube/v3/search";

export interface YouTubeVideo {
    id: string;
    title: string;
    views: string; // La API de búsqueda no da views sin otro llamado extra, simularemos el placeholder
    image: string;
    lang: string;
    url: string;
}

try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${baseUrl}/api/youtube?q=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Error de YouTube Backend: ${response.status}`);
    }

    const videos = await response.json();
    return Array.isArray(videos) ? videos : [];

} catch (error) {
    console.error("Fallo obteniendo YouTube Videos:", error);
    return [];
}
};
