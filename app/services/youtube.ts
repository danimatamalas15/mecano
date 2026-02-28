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

export const sortYouTubeVideos = (videos: YouTubeVideo[], vehicleCriteria: string, problemCriteria: string): YouTubeVideo[] => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w\sáéíóúñ]/g, '').split(' ').filter(w => w.length > 2);

    const vehicleWords = normalize(vehicleCriteria);
    const problemWords = normalize(problemCriteria);

    return videos.sort((a, b) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();

        let scoreA = 0;
        let scoreB = 0;

        const hasVehicleA = vehicleWords.some(w => titleA.includes(w));
        const hasProblemA = problemWords.some(w => titleA.includes(w));

        // 1. Marca, modelo y tipo + problema
        if (hasVehicleA && hasProblemA) scoreA += 100;
        // 2. Solo problema
        else if (hasProblemA) scoreA += 50;
        // 3. Relacionados al vehiculo
        else if (hasVehicleA) scoreA += 10;

        const hasVehicleB = vehicleWords.some(w => titleB.includes(w));
        const hasProblemB = problemWords.some(w => titleB.includes(w));

        if (hasVehicleB && hasProblemB) scoreB += 100;
        else if (hasProblemB) scoreB += 50;
        else if (hasVehicleB) scoreB += 10;

        return scoreB - scoreA;
    });
};
