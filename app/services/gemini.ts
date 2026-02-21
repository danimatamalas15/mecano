export const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

export const fetchGeminiResponse = async (prompt: string): Promise<string[]> => {
    // Busca la clave de la API en las variables de entorno o usa la proporcionada como fallback
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "AIzaSyAlZPIQehq6V6OsnyVbHktHxxgfpCFSY48";

    if (!apiKey) {
        console.warn("Falta EXPO_PUBLIC_GEMINI_API_KEY en .env. Devolviendo respuesta inteligente simulada para el prompt:", prompt);
        return [
            "Análisis avanzado de los datos introducidos completado.",
            "• Posible fallo de desgaste en los componentes principales solicitados.",
            "• Te sugerimos revisar las conexiones o los sensores relacionados directa e indirectamente.",
            "• Si el problema persiste, es recomendable consultar manual de taller del fabricante."
        ];
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.3, // Temperatura baja para respuestas técnicas precisas
                    maxOutputTokens: 300,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Error en la API de Gemini: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            // Limpia asteriscos de Markdown (**) para que quede texto limpio para React Native
            const cleanText = text.replace(/\*\*/g, '');
            // Divide por saltos de línea y filtra las líneas vacías
            return cleanText.split('\n').filter((line: string) => line.trim().length > 0);
        }

        throw new Error("Respuesta vacía o formato inesperado de Gemini");

    } catch (error) {
        console.error("Error al obtener respuesta de Gemini:", error);
        throw error;
    }
};
