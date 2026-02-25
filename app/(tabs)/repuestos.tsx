import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ActivityIndicator, Linking, Platform } from "react-native";

export default function Repuestos() {
    const [hasSearched, setHasSearched] = useState(false);
    const [vehicleQuery, setVehicleQuery] = useState("");
    const [itemQuery, setItemQuery] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!vehicleQuery.trim() || !itemQuery.trim()) {
            alert("Por favor, rellena el vehículo y el repuesto que buscas.");
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setResults([]);

        try {
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const relativeUrl = `${baseUrl}/api/buscar?vehiculo=${encodeURIComponent(vehicleQuery)}&repuesto=${encodeURIComponent(itemQuery)}`;

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
            console.error("Error buscando repuestos:", error);
            alert("Hubo un error de conexión con tu servidor. Inténtalo de nuevo más tarde.");
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
                    <Text style={styles.label}>1. Vehículo - en este orden: Marca - Modelo - Versión - Motor - Año fabricación</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="car-outline" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput style={styles.searchInput} placeholder="Ej: Ford Focus 2015..." placeholderTextColor="#94a3b8" value={vehicleQuery} onChangeText={setVehicleQuery} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>2. ¿Qué repuesto necesitas?</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput style={styles.searchInput} placeholder="Ej: Filtro de aceite Bosch..." placeholderTextColor="#94a3b8" value={itemQuery} onChangeText={setItemQuery} />
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
                    <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>BUSCAR REPUESTOS</Text>
                </TouchableOpacity>
            </View>

            {/* INDICADOR DE CARGA */}
            {isLoading && (
                <View style={{ padding: 30, alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#f59e0b" />
                    <Text style={{ marginTop: 10, color: "#64748b" }}>Buscando repuestos exactos...</Text>
                </View>
            )}

            {/* RESULTADOS DE BÚSQUEDA */}
            {hasSearched && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Mejores Resultados para "{itemQuery}"</Text>
                    <Text style={{ color: "#64748b", marginBottom: 16, marginTop: -10 }}>Compatibles con {vehicleQuery}</Text>

                    {/* LISTA DE RESULTADOS */}
                    <View style={styles.listContainer}>
                        {results.length === 0 ? (
                            <Text style={{ textAlign: "center", color: "#64748b", marginTop: 20 }}>No se encontraron repuestos específicos. Intenta usar términos más generales.</Text>
                        ) : (
                            results.map((item, index) => {
                                const imageSrc = item.pagemap?.cse_image?.[0]?.src || "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150";

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
        backgroundColor: "#f59e0b", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10,
        flexDirection: "row", justifyContent: "center"
    },
    submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

    // Results
    resultsContainer: { borderTopWidth: 2, borderTopColor: "#e2e8f0", paddingTop: 20 },
    resultsTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
    filtersWrapper: { marginBottom: 16, gap: 12 },
    filterGroup: { gap: 6 },
    filterLabel: { fontSize: 13, fontWeight: "600", color: "#64748b" },
    filterScroll: { gap: 8, paddingRight: 20 },
    filterPill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0"
    },
    filterPillActive: { backgroundColor: "#f59e0b", borderColor: "#d97706" },
    filterPillText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
    filterPillTextActive: { color: "#ffffff", fontWeight: "bold" },

    listContainer: { gap: 12 },
    resultCard: {
        flexDirection: "row", backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: "#e2e8f0", padding: 12, alignItems: "center",
        elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4
    },
    resultImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: "#f1f5f9" },
    resultInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
    resultName: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
    resultMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
    resultStore: { fontSize: 12, color: "#64748b", fontWeight: "600" },
    badgeWrapper: { backgroundColor: "#e0f2fe", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    conditionBadge: { fontSize: 10, color: "#0284c7", fontWeight: "bold" },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    resultPrice: { fontSize: 16, fontWeight: "bold", color: "#10b981" },
    ratingBox: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    ratingText: { fontSize: 11, color: "#b45309", fontWeight: "bold" },
    chevronBox: { paddingLeft: 10 }
});
