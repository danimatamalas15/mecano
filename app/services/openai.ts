export const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const fetchChatGPTResponse = async (prompt: string): Promise<string[]> => {
    // Busca la clave de la API en las variables de entorno exclusivamente por seguridad
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.warn("Falta EXPO_PUBLIC_OPENAI_API_KEY en .env. Devolviendo respuesta inteligente simulada para el prompt:", prompt);
        return [
            "Análisis avanzado de los datos introducidos completado por GPT.",
            "• Posible fallo de desgaste detectado en los componentes principales solicitados.",
            "• Te sugerimos revisar las conexiones o los sensores relacionados directa e indirectamente.",
            "• Si el problema persiste, es altamente recomendable consultar el manual de taller del fabricante."
        ];
    }

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Puedes cambiar de modelo aquí (ej. gpt-3.5-turbo o gpt-4)
                messages: [
                    {
                        role: "system",
                        content: "Eres un útil asistente de mecánica automotriz avanzado. Responde en un tono profesional."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            let errorDetail = response.statusText;
            try {
                const errorBody = await response.json();
                if (errorBody && errorBody.error && errorBody.error.message) {
                    errorDetail = errorBody.error.message;
                } else {
                    errorDetail = JSON.stringify(errorBody);
                }
            } catch (e) {
                // Fallback por defecto si no es json parseable
                errorDetail = response.statusText || `HTTP Status: ${response.status}`;
            }
            throw new Error(`[HTTP ${response.status}] ${errorDetail}`);
        }

        const data = await response.json();
        const text = data.choices?.[0]?.message?.content;

        if (text) {
            // Limpia asteriscos de Markdown (**) para que quede texto limpio para React Native
            const cleanText = text.replace(/\*\*/g, '');
            // Divide por saltos de línea y filtra las líneas vacías
            return cleanText.split('\n').filter((line: string) => line.trim().length > 0);
        }

        throw new Error("Respuesta vacía o formato inesperado por parte de ChatGPT (OpenAI)");

    } catch (error) {
        console.error("Error al obtener respuesta de ChatGPT:", error);
        throw error;
    }
};

export interface SparePart {
    id: string;
    name: string;
    store: string;
    price: string;
    condition: string;
    rating: string;
    image: string;
    url: string;
}

export const fetchChatGPTSpares = async (vehicle: string, part: string): Promise<SparePart[]> => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return [
            { id: "1", name: `(Mock) ${part} para ${vehicle}`, store: "Amazon", price: "25,00 €", condition: "Nuevo", rating: "4.5", image: "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150", url: "https://amazon.es" },
            { id: "2", name: `(Mock) Kit ${part} genérico`, store: "Autodoc", price: "18,99 €", condition: "Nuevo", rating: "4.0", image: "https://images.unsplash.com/photo-1647426867375-7b79aed8b51d?q=80&w=150", url: "https://autodoc.es" }
        ];
    }

    const prompt = `Actúa como un experto en recambios de automóviles.
El usuario busca el repuesto "${part}" para el vehículo "${vehicle}".
Genera una lista de 5 posibles opciones reales o muy realistas de repuestos compatibles con ese vehículo en tiendas online (Amazon, Oscaro, Autodoc, AliExpress, Milanuncios).

Debes devolver obligatoriamente la respuesta en formato JSON de un array, respetando estrictamente la estructura sin texto adicional ni bloques markdown alrededor, pura sintaxis JSON válida. Cada objeto debe tener los siguientes campos de texto (strings):
[
  {
    "id": "1",
    "name": "Nombre exacto y marca del repuesto para ese vehículo...",
    "store": "Nombre de tienda",
    "price": "Ej: 24,99 €",
    "condition": "Nuevo ó Segunda Mano",
    "rating": "Ej: 4.8",
    "image": "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150",
    "url": "https://www.google.com/search?q=comprar+..."
  }
]
Asegúrate de cambiar las urls de búsqueda para que apunten al repuesto + modelo a buscar en google. Emplea siempre una foto generica real que te di, como: https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150 , variando ligeramente.`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "Eres una API que devuelve exclusivamente JSON válido crudo. No incluyas backticks, ni markdown, ni menciones 'Aquí tienes el json'."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.2
            })
        });

        if (!response.ok) {
            throw new Error(`[HTTP ${response.status}] al generar repuestos.`);
        }

        const data = await response.json();
        let text = data.choices?.[0]?.message?.content?.trim() || "[]";

        // Netear el posible bloque de codigo ```json si la IA no obedece
        text = text.replace(/^```json/g, "").replace(/^```/g, "").replace(/```$/g, "").trim();

        const spares: SparePart[] = JSON.parse(text);
        return spares;
    } catch (error) {
        console.error("Fallo obteniendo JSON de Spares via ChatGPT:", error);
        return [];
    }
};
