import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Herramientas() {
    const [hasSearched, setHasSearched] = useState(false);
    const [itemQuery, setItemQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!itemQuery.trim()) {
            alert("Por favor, introduce la herramienta que deseas buscar.");
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setResults([]);

        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const relativeUrl = `${baseUrl}/api/buscar?herramienta=${encodeURIComponent(itemQuery)}`;

            const response = await fetch(relativeUrl);
            const data = await response.json();

            if (response.ok && data.items) {
                setResults(data.items);
            } else if (data.error) {
                alert(`Error del servidor: ${data.error}`);
            } else {
                setResults([]);
            }
            setHasSearched(true);
        } catch (error) {
            console.error("Error buscando herramientas:", error);
            alert("Hubo un error de conexión con el servidor de búsqueda.");
        } finally {
            setIsLoading(false);
        }
    };

    const openLink = (url: string) => {
        if (url && url !== "#") {
            Linking.openURL(url).catch((err) => console.error("Error abriendo URL externa: ", err));
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* FORMULARIO DE BÚSQUEDA */}
            <View style={styles.formContainer}>
                <View style={styles.section}>
                    <Text style={styles.label}>1. ¿Qué herramienta necesitas?</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput style={styles.searchInput} placeholder="Ej: Llave dinamométrica..." placeholderTextColor="#94a3b8" value={itemQuery} onChangeText={setItemQuery} />
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>BUSCAR HERRAMIENTAS</Text>
                </TouchableOpacity>
            </View>

            {/* INDICADOR DE CARGA */}
            {isLoading && (
                <View style={{ padding: 30, alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#8b5cf6" />
                    <Text style={{ marginTop: 10, color: "#64748b" }}>Buscando herramientas exactas...</Text>
                </View>
            )}

            {/* RESULTADOS DE BÚSQUEDA */}
            {hasSearched && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Mejores Opciones de "{itemQuery}"</Text>
                    <Text style={{ color: "#64748b", marginBottom: 16, marginTop: -10 }}>Herramientas reales recomendadas</Text>

                    {/* LISTA DE RESULTADOS */}
                    <View style={styles.listContainer}>
                        {results.length === 0 ? (
                            <Text style={{ textAlign: "center", color: "#64748b", marginTop: 20 }}>No se encontraron herramientas específicas. Intenta usar términos más generales.</Text>
                        ) : (
                            results.map((item, index) => {
                                const imageSrc = item.pagemap?.cse_image?.[0]?.src || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=150";

                                const cardContent = (
                                    <>
                                        <Image source={{ uri: imageSrc }} style={styles.resultImage} />
                                        <View style={styles.resultInfo}>
                                            <Text style={styles.resultName} numberOfLines={2}>{item.title}</Text>
                                            <View style={styles.resultMetaRow}>
                                                <Text style={styles.resultStore}>{item.displayLink}</Text>
                                            </View>
                                            <Text style={{ fontSize: 12, color: "#64748b", marginTop: 4 }} numberOfLines={2}>{item.snippet}</Text>
                                        </View>
                                        <View style={styles.chevronBox}>
                                            <Ionicons name="open-outline" size={20} color="#94a3b8" />
                                        </View>
                                    </>
                                );

                                if (Platform.OS === 'web') {
                                    return (
                                        <a
                                            key={index}
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ textDecoration: 'none', display: 'flex' }}
                                        >
                                            <View style={[styles.resultCard, { flex: 1 }]}>
                                                {cardContent}
                                            </View>
                                        </a>
                                    );
                                }

                                return (
                                    <TouchableOpacity key={index} style={styles.resultCard} onPress={() => openLink(item.link)}>
                                        {cardContent}
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                </View>
            )}

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    content: { padding: 20, paddingBottom: 40 },
    formContainer: { marginBottom: 20 },
    section: { marginBottom: 16 },
    label: { fontSize: 15, fontWeight: "600", color: "#1e293b", marginBottom: 8 },
    dropdown: {
        backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
        padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center"
    },
    dropdownText: { color: "#64748b", fontSize: 14 },
    divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 10 },
    searchContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff",
        borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingLeft: 12, paddingRight: 6
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#1e293b" },
    voiceButtonSmall: {
        backgroundColor: "#ef4444", width: 34, height: 34, borderRadius: 17,
        justifyContent: "center", alignItems: "center"
    },
    submitButton: {
        backgroundColor: "#8b5cf6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10,
        flexDirection: "row", justifyContent: "center"
    },
    submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

    // Results
    resultsContainer: { borderTopWidth: 2, borderTopColor: "#e2e8f0", paddingTop: 20 },
    resultsTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
    listContainer: { gap: 12 },
    resultCard: {
        flexDirection: "row", backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: "#e2e8f0", padding: 12, alignItems: "center",
        elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4
    },
    resultImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: "#f1f5f9" },
    resultInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
    resultName: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
    resultMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 0 },
    resultStore: { fontSize: 12, color: "#64748b", fontWeight: "600", marginBottom: 0 },
    chevronBox: { paddingLeft: 10 }
});
