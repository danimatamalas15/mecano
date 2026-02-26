export async function GET(request: Request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    const { searchParams } = new URL(request.url);
    const marca = searchParams.get('marca') || '';
    const modelo = searchParams.get('modelo') || '';
    const version = searchParams.get('version') || '';
    const motor = searchParams.get('motor') || '';
    const ano = searchParams.get('ano') || '';
    const repuesto = searchParams.get('repuesto');
    const herramienta = searchParams.get('herramienta');

    let query = '';

    if (marca || modelo || repuesto) {
        query = `comprar ${repuesto} para ${marca} ${modelo} ${version} ${motor} ${ano}`.trim();
    } else if (herramienta) {
        query = `comprar herramienta ${herramienta}`;
    } else {
        return new Response(JSON.stringify({ error: 'Faltan parámetros de búsqueda válidos (vehiculo/repuesto, o herramienta)' }), {
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

    const urlBase = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&num=10`;

    const mockFallback = () => {
        return {
            items: [
                {
                    title: `Comprar ${query} en Amazon`,
                    link: `https://www.amazon.es/s?k=${encodeURIComponent(query)}`,
                    displayLink: 'amazon.es',
                    snippet: `Encuentra los mejores precios para ${query} y recíbelo cómodamente en casa.`,
                    pagemap: {},
                },
                {
                    title: `Ofertas de ${query} en eBay`,
                    link: `https://www.ebay.es/sch/i.html?_nkw=${encodeURIComponent(query)}`,
                    displayLink: 'ebay.es',
                    snippet: `Compra ${query} con confianza. Gran selección de repuestos y herramientas.`,
                    pagemap: {},
                },
                {
                    title: `Catálogo de ${query} - Oscaro`,
                    link: `https://www.oscaro.es/search?q=${encodeURIComponent(query)}`,
                    displayLink: 'oscaro.es',
                    snippet: `Piezas de recambio y accesorios para ${query}. Entrega rápida asegurada.`,
                    pagemap: {},
                },
                {
                    title: `Repuestos y herramientas: ${query} en Autodoc`,
                    link: `https://www.autodoc.es/search?keyword=${encodeURIComponent(query)}`,
                    displayLink: 'autodoc.es',
                    snippet: `Amplia gama de piezas y herramientas para tu vehículo en la tienda online.`,
                    pagemap: {},
                }
            ],
            searchInformation: {
                totalResults: '4',
            },
            fallbackProvider: 'mock',
            fallbackReason: 'Google Custom Search API sin acceso; mostrando enlaces directos.',
        };
    };

    try {
        const starts = [1, 11, 21, 31, 41];
        let allItems: any[] = [];
        let hasError = false;
        let lastResponse: any = null;
        let lastErrorMsg = '';
        let lastStatus = 200;

        // Peticiones concurrentes limitadas por página
        const fetchPromises = starts.map(start => fetch(`${urlBase}&start=${start}`));
        const responses = await Promise.all(fetchPromises);

        for (const response of responses) {
            const data = await response.json();

            if (!response.ok) {
                hasError = true;
                lastResponse = data;
                lastStatus = response.status;
                lastErrorMsg = data.error?.message || response.statusText;
                break;
            }

            if (data.items && data.items.length > 0) {
                allItems = allItems.concat(data.items);
            }
        }

        if (hasError) {
            const canFallback = lastStatus === 403 || lastStatus === 429;

            if (canFallback || (typeof lastErrorMsg === 'string' && lastErrorMsg.includes('does not have the access to Custom Search JSON API'))) {
                return new Response(JSON.stringify(mockFallback()), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                });
            }

            return new Response(JSON.stringify({ error: `Google CX falló: ${lastErrorMsg}` }), {
                status: lastStatus,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
            });
        }

        return new Response(JSON.stringify({ items: allItems }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    } catch (error) {
        console.warn('Error en la petición a Google Search API, utilizando mockFallback:', error);
        return new Response(JSON.stringify(mockFallback()), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
    }
}
