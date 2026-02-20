import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

// Mock Data
const MOCK_RESULTS = [
    { id: "1", name: "Filtro de Aceite Bosch Premium", store: "Amazon", price: "12,50 €", condition: "Nuevo", rating: "4.8", image: "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150" },
    { id: "2", name: "Filtro Aceite Original OEM", store: "Oscaro", price: "9,99 €", condition: "Nuevo", rating: "4.5", image: "https://images.unsplash.com/photo-1647426867375-7b79aed8b51d?q=80&w=150" },
    { id: "3", name: "Lote 3 Filtros de Aceite Genéricos", store: "AliExpress", price: "15,00 €", condition: "Nuevo", rating: "3.5", image: "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150" },
    { id: "4", name: "Carcasa Filtro de Aceite (Desguace)", store: "Milanuncios", price: "5,00 €", condition: "Segunda Mano", rating: "-", image: "https://images.unsplash.com/photo-1621252179027-94459d278660?q=80&w=150" }
];

export default function Repuestos() {
    const [hasSearched, setHasSearched] = useState(false);
    const [conditionFilter, setConditionFilter] = useState<"Todos" | "Nuevos" | "Segunda Mano">("Todos");
    const [orderFilter, setOrderFilter] = useState<"Precio" | "Calidad" | "Nombre">("Precio");

    const openLink = (store: string) => {
        alert(`Abriendo tienda externa:\n${store}`);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* FORMULARIO DE BÚSQUEDA */}
            <View style={styles.formContainer}>
                <View style={styles.section}>
                    <Text style={styles.label}>1. Búsqueda Directa</Text>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput style={styles.searchInput} placeholder="Ej: Filtro de aceite Bosch..." placeholderTextColor="#94a3b8" />
                        <TouchableOpacity style={styles.voiceButtonSmall}>
                            <Ionicons name="mic" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.label}>2. Búsqueda por Marca</Text>
                    <TouchableOpacity style={styles.dropdown}>
                        <Text style={styles.dropdownText}>Seleccionar marca de repuesto...</Text>
                        <Ionicons name="chevron-down" size={20} color="#64748b" />
                    </TouchableOpacity>
                    <View style={[styles.searchContainer, { marginTop: 12 }]}>
                        <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                        <TextInput style={styles.searchInput} placeholder="Buscar dentro de la marca..." placeholderTextColor="#94a3b8" />
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={() => setHasSearched(true)}>
                    <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>BUSCAR REPUESTOS</Text>
                </TouchableOpacity>
            </View>

            {/* RESULTADOS DE BÚSQUEDA */}
            {hasSearched && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Mejores Ofertas Encontradas</Text>

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
                        {MOCK_RESULTS.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => openLink(item.store)}>
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
