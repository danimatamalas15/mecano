import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ActivityIndicator, Linking, Platform } from "react-native";
import { fetchChatGPTSpares, SparePart } from "../services/openai";

export default function Repuestos() {
    const [hasSearched, setHasSearched] = useState(false);
    const [vehicleQuery, setVehicleQuery] = useState("");
    const [itemQuery, setItemQuery] = useState("");
    const [conditionFilter, setConditionFilter] = useState<"Todos" | "Nuevos" | "Segunda Mano">("Todos");
    const [orderFilter, setOrderFilter] = useState<"Precio" | "Calidad" | "Nombre">("Precio");

    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SparePart[]>([]);

    const handleSearch = async () => {
        if (!vehicleQuery.trim() || !itemQuery.trim()) {
            alert("Por favor, rellena el vehículo y el repuesto que buscas.");
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setResults([]);

        try {
            const fetchedSpares = await fetchChatGPTSpares(vehicleQuery, itemQuery);
            setResults(fetchedSpares);
            setHasSearched(true);
        } catch (error) {
            console.error("Error buscando repuestos:", error);
            alert("Ocurrió un error al intentar buscar los repuestos con la IA.");
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

                    {/* FILTROS */}
                    <View style={styles.filtersWrapper}>
                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Estado:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {["Todos", "Nuevos", "Segunda Mano"].map((ctg) => (
                                    <TouchableOpacity
                                        key={ctg}
                                        style={[styles.filterPill, conditionFilter === ctg && styles.filterPillActive]}
                                        onPress={() => setConditionFilter(ctg as any)}
                                    >
                                        <Text style={[styles.filterPillText, conditionFilter === ctg && styles.filterPillTextActive]}>{ctg}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.filterGroup}>
                            <Text style={styles.filterLabel}>Ordenar por:</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                                {["Precio", "Calidad", "Nombre"].map((ord) => (
                                    <TouchableOpacity
                                        key={ord}
                                        style={[styles.filterPill, orderFilter === ord && styles.filterPillActive]}
                                        onPress={() => setOrderFilter(ord as any)}
                                    >
                                        <Text style={[styles.filterPillText, orderFilter === ord && styles.filterPillTextActive]}>{ord}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* LISTA DE RESULTADOS */}
                    <View style={styles.listContainer}>
                        {results.length === 0 ? (
                            <Text style={{ textAlign: "center", color: "#64748b", marginTop: 20 }}>No se encontraron repuestos.</Text>
                        ) : (
                            results.map((item) => {
                                const cardContent = (
                                    <>
                                        <Image source={{ uri: item.image }} style={styles.resultImage} />
                                        <View style={styles.resultInfo}>
                                            <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                                            <View style={styles.resultMetaRow}>
                                                <Text style={styles.resultStore}>{item.store}</Text>
                                                <View style={styles.badgeWrapper}>
                                                    <Text style={styles.conditionBadge}>{item.condition}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.priceRow}>
                                                <Text style={styles.resultPrice}>{item.price}</Text>
                                                <View style={styles.ratingBox}>
                                                    <Ionicons name="star" size={12} color="#f59e0b" />
                                                    <Text style={styles.ratingText}>{item.rating}</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.chevronBox}>
                                            <Ionicons name="open-outline" size={20} color="#94a3b8" />
                                        </View>
                                    </>
                                );

                                if (Platform.OS === 'web') {
                                    return (
                                        <a
                                            key={item.id}
                                            href={item.url}
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
                                    <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => openLink(item.url)}>
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
