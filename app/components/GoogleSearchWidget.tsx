import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
    query: string;
}

export default function GoogleSearchWidget({ query }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Usamos el CX por defecto (del cliente) o la env genérica
    const cx = process.env.EXPO_PUBLIC_GOOGLE_CX || 'f2f83861f059a4ca4';

    // Construimos el HTML base inyectando SDK de Google y estilos limpios
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body { margin: 0; padding: 10px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; }
                /* Ocultamos bordes innecesarios del Widget */
                .gsc-control-cse { padding: 0 !important; border: none !important; background-color: transparent !important; }
            </style>
        </head>
        <body>
            <div class="gcse-search" data-gname="store-search" data-linktarget="_blank"></div>
            <script>
                // Sobrescribimos la inicialización para auto-lanzar la búsqueda
                window.__gcse = {
                    initializationCallback: function() {
                        if ('${query}') {
                            var element = google.search.cse.element.getElement('store-search');
                            if (element) {
                                element.execute('${query}');
                            }
                        }
                    }
                };
            </script>
            <script async src="https://cse.google.com/cse.js?cx=${cx}"></script>
        </body>
        </html>
    `;

    useEffect(() => {
        if (Platform.OS === 'web') {
            if (iframeRef.current && iframeRef.current.contentWindow) {
                const doc = iframeRef.current.contentWindow.document;
                doc.open();
                doc.write(htmlContent);
                doc.close();
            }
        }
    }, [htmlContent]);

    // Render Web (Iframe)
    if (Platform.OS === 'web') {
        return (
            <View style={styles.container}>
                {isLoading && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color="#8b5cf6" />
                    </View>
                )}
                {/* @ts-ignore - React Native Web permite renderizar iframes como elementos HTML nativos */}
                <iframe
                    ref={iframeRef}
                    style={{ width: '100%', minHeight: '800px', height: '100%', border: 'none', position: isLoading ? 'absolute' : 'relative', opacity: isLoading ? 0 : 1 }}
                    title="Google Search"
                    onLoad={() => setIsLoading(false)}
                />
            </View>
        );
    }

    // Render Mobile (React Native WebView)
    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                </View>
            )}
            <WebView
                source={{ html: htmlContent, baseUrl: 'https://www.google.com' }}
                style={{ flex: 1, backgroundColor: 'transparent', opacity: isLoading ? 0 : 1 }}
                originWhitelist={['*']}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                onLoadEnd={() => setIsLoading(false)}
                onShouldStartLoadWithRequest={(request) => {
                    // Prevenir la navegación interna en la WebView y enviarla al navegador nativo
                    if (request.url !== 'about:blank' && !request.url.startsWith('https://www.google.com') && !request.url.startsWith('data:')) {
                        Linking.openURL(request.url);
                        return false; // Bloquear en el Iframe
                    }
                    return true; // Permitir carga de scripts internos de Google
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 800,
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 10
    },
    loader: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        zIndex: 10
    }
});
