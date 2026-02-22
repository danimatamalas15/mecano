import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Herramientas() {
    const [hasSearched, setHasSearched] = useState(false);
    const [itemQuery, setItemQuery] = useState("");
    const [orderFilter, setOrderFilter] = useState<"Precio" | "Calidad" | "Nombre">("Precio");
    const [mockResults, setMockResults] = useState<any[]>([]);

    const generateMockResults = (query: string) => {
        const STORES = ["Amazon", "Ebay", "AliExpress", "AutoParts", "MecanoStore"];
        return Array.from({ length: 100 }).map((_, i) => {
            const storeName = STORES[i % STORES.length];
            const itemName = `${query} Profesional - Modelo ${i + 1}`;
            return {
                id: String(i + 1),
                name: itemName,
                store: storeName,
                price: `${(Math.random() * 100 + 10).toFixed(2).replace('.', ',')} €`,
                rating: (Math.random() * 2 + 3).toFixed(1), // entre 3.0 y 5.0
                image: [
                    "https://images.unsplash.com/photo-1544473636-6e792eabcbba?q=80&w=150",
                    "https://images.unsplash.com/photo-1530893609608-32a9af3aa95c?q=80&w=150",
                    "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=150"
                ][i % 3],
                url: `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(itemName + ' ' + storeName)}`
            };
        });
    };

    const handleSearch = () => {
        if (!itemQuery.trim()) {
            alert("Por favor, introduce la herramienta que deseas buscar.");
            return;
        }
        setMockResults(generateMockResults(itemQuery));
        setOrderFilter("Precio"); // Predefinido por precio menor a mayor cada vez que se busca
        setHasSearched(true);
    };

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Error al abrir URL:", err));
    };

    const sortedResults = [...mockResults].sort((a, b) => {
        if (orderFilter === "Precio") {
            const priceA = parseFloat(a.price.replace(',', '.'));
            const priceB = parseFloat(b.price.replace(',', '.'));
            return priceA - priceB;
        }
        if (orderFilter === "Calidad") {
            const ratingA = parseFloat(a.rating);
            const ratingB = parseFloat(b.rating);
            // Ordenar calidad de mayor a menor
            return ratingB - ratingA;
        }
        if (orderFilter === "Nombre") {
            return a.name.localeCompare(b.name);
        }
        return 0;
    });

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

            {/* RESULTADOS DE BÚSQUEDA */}
            {hasSearched && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Mejores Opciones de "{itemQuery}"</Text>
                    <Text style={{ color: "#64748b", marginBottom: 16, marginTop: -10 }}>Herramientas recomendadas</Text>

                    {/* FILTROS */}
                    <View style={styles.filtersWrapper}>
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
                        {sortedResults.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => openLink(item.url)}>
                                <Image source={{ uri: item.image }} style={styles.resultImage} />
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                                    <Text style={styles.resultStore}>{item.store}</Text>
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
                            </TouchableOpacity>
                        ))}
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
    filtersWrapper: { marginBottom: 16, gap: 12 },
    filterGroup: { gap: 6 },
    filterLabel: { fontSize: 13, fontWeight: "600", color: "#64748b" },
    filterScroll: { gap: 8, paddingRight: 20 },
    filterPill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0"
    },
    filterPillActive: { backgroundColor: "#8b5cf6", borderColor: "#6d28d9" },
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
    resultStore: { fontSize: 12, color: "#64748b", fontWeight: "600", marginBottom: 6 },
    priceRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    resultPrice: { fontSize: 16, fontWeight: "bold", color: "#10b981" },
    ratingBox: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    ratingText: { fontSize: 11, color: "#b45309", fontWeight: "bold" },
    chevronBox: { paddingLeft: 10 }
});
