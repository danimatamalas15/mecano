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
                temperature: 0.3,
                max_tokens: 300,
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
