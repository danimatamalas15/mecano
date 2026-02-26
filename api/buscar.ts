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
    const vehiculo = searchParams.get('vehiculo');
    const repuesto = searchParams.get('repuesto');
    const herramienta = searchParams.get('herramienta');

    let query = '';

    if (vehiculo && repuesto) {
        query = `comprar ${repuesto} para ${vehiculo}`;
    } else if (herramienta) {
        query = `comprar herramienta ${herramienta}`;
    } else {
        return new Response(JSON.stringify({ error: 'Faltan parámetros de búsqueda válidos (vehiculo/repuesto, o herramienta)' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_SEARCH_API_KEY || process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    const cx = process.env.GOOGLE_CX || process.env.EXPO_PUBLIC_GOOGLE_CX || 'f2f83861f059a4ca4';

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Falta configurar API Key (EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY) en el servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`;

    const duckDuckGoFallback = async () => {
        const fallbackUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();

        if (!fallbackResponse.ok) {
            throw new Error(`DuckDuckGo falló: ${fallbackResponse.statusText}`);
        }

        const topics = Array.isArray(fallbackData.RelatedTopics) ? fallbackData.RelatedTopics : [];
        const flattenTopics = topics.flatMap((topic: any) => {
            if (Array.isArray(topic.Topics)) {
                return topic.Topics;
            }
            return topic;
        });

        const items = flattenTopics
            .filter((topic: any) => topic?.FirstURL && topic?.Text)
            .slice(0, 10)
            .map((topic: any) => ({
                title: topic.Text,
                link: topic.FirstURL,
                displayLink: 'duckduckgo.com',
                snippet: topic.Text,
                pagemap: {},
            }));

        return {
            items,
            searchInformation: {
                totalResults: String(items.length),
            },
            fallbackProvider: 'duckduckgo',
            fallbackReason: 'Google Custom Search JSON API sin acceso en este proyecto',
        };
    };

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            const googleMessage = data.error?.message || response.statusText;
            const canFallback = response.status === 403 && typeof googleMessage === 'string' && googleMessage.includes('does not have the access to Custom Search JSON API');

            if (canFallback) {
                const fallbackData = await duckDuckGoFallback();
                return new Response(JSON.stringify(fallbackData), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            return new Response(JSON.stringify({ error: `Google CX falló: ${data.error?.message || response.statusText}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error conectando con Google Custom Search', details: String(error) }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
