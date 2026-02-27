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
    const query = searchParams.get('q');

    if (!query) {
        return new Response(JSON.stringify({ error: 'Falta el parámetro de búsqueda (q)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
    const cx = process.env.GOOGLE_CX || process.env.EXPO_PUBLIC_GOOGLE_CX || 'f2f83861f059a4ca4';

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Falta configurar API Key (EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY) en el servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const searchQuery = `forum OR tutorial OR faq OR fix ${query}`;
    const urlBase = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(searchQuery)}&num=10`;

    const mockFallback = () => {
        return {
            items: [
                {
                    title: `Buscar foros sobre: ${query}`,
                    link: `https://www.google.com/search?q=${encodeURIComponent('foro ' + query)}`,
                    displayLink: 'google.com',
                    snippet: `Búsqueda manual de webs y tutoriales.`,
                }
            ],
            fallbackProvider: 'mock',
        };
    };

    try {
        const starts = [1, 11, 21, 31, 41];
        let allItems: any[] = [];
        let hasError = false;
        let lastErrorMsg = '';
        let lastStatus = 200;

        const fetchPromises = starts.map(start => fetch(`${urlBase}&start=${start}`));
        const responses = await Promise.all(fetchPromises);

        for (const response of responses) {
            const data = await response.json();

            if (!response.ok) {
                hasError = true;
                lastStatus = response.status;
                lastErrorMsg = data.error?.message || response.statusText;
                break;
            }

            if (data.items && data.items.length > 0) {
                allItems = allItems.concat(data.items);
            }
        }

        if (hasError) {
            console.warn(`Error en Custom Search Foros: ${lastErrorMsg}`);
            return new Response(JSON.stringify(mockFallback()), {
                status: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        return new Response(JSON.stringify({ items: allItems }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        console.error('Error interno API foros:', error);
        return new Response(JSON.stringify(mockFallback()), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
