import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';

export function useVoiceToText() {
    const [isListening, setIsListening] = useState(false);

    // Almacenamos la instancia para poder detenerla
    const recognitionRef = useRef<any>(null);

    const startListening = useCallback((onResult: (text: string) => void) => {
        if (Platform.OS !== 'web') {
            alert('El reconocimiento de voz nativo requiere un plugin adicional en la app móvil. Esta función está actualmente soportada en la versión Web.');
            return;
        }

        // Evitar errores de SSR (Server-Side Rendering)
        if (typeof window === 'undefined') return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Tu navegador web no soporta el reconocimiento de voz.');
            return;
        }

        // Si ya está escuchando, lo detenemos
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.lang = 'es-ES'; // Idioma por defecto: español
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Error en speech recognition:", event.error);
            setIsListening(false);
            if (event.error === 'not-allowed') {
                alert('Permiso de micrófono denegado. Por favor, actívalo en tu navegador.');
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    }, [isListening]);

    return {
        isListening,
        startListening
    };
}
