import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type TallerType = "Mecánica" | "Chapa" | "Electrónica" | "Neumáticos";

// Mock Data
const MOCK_TALLERES = [
    { id: "1", name: "Taller Mecánico Hermanos Ruiz", address: "Calle Mayor 12, Madrid", distance: "1.2 km", rating: "4.9", reviews: 154, type: "Mecánica" },
    { id: "2", name: "Auto Repuestos Motor Express", address: "Avenida de América 45, Madrid", distance: "2.5 km", rating: "4.5", reviews: 89, type: "Mecánica" },
    { id: "3", name: "Servicio Oficial Bosch Service", address: "Calle de Alcalá 120, Madrid", distance: "3.1 km", rating: "4.2", reviews: 312, type: "Electrónica" }
];

export default function Talleres() {
    const [tallerType, setTallerType] = useState<TallerType | null>(null);
    const [locationType, setLocationType] = useState<"Auto" | "Manual" | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [orderFilter, setOrderFilter] = useState<"Proximidad" | "Calificación en Google">("Proximidad");

    const TALLERES: { type: TallerType; icon: any }[] = [
        { type: "Mecánica", icon: "hardware-chip-outline" },
        { type: "Chapa", icon: "color-fill-outline" },
        { type: "Electrónica", icon: "flash-outline" },
        { type: "Neumáticos", icon: "disc-outline" },
    ];

    const handleOpenMap = (address: string) => {
        alert(`Abriendo Google Maps en:\n${address}`);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* FORMULARIO */}
            <View style={styles.formContainer}>
                <View style={styles.section}>
                    <Text style={styles.label}>1. Tipo de Taller</Text>
                    <View style={styles.grid}>
                        {TALLERES.map((taller) => (
                            <TouchableOpacity
                                key={taller.type}
                                style={[styles.gridButton, tallerType === taller.type && styles.gridButtonActive]}
                                onPress={() => setTallerType(taller.type)}
                            >
                                <Ionicons name={taller.icon} size={24} color={tallerType === taller.type ? "#fff" : "#3b82f6"} style={styles.gridIcon} />
                                <Text style={[styles.gridButtonText, tallerType === taller.type && styles.gridTextActive]}>{taller.type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.section}>
                    <Text style={styles.label}>2. Ubicación</Text>
                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.typeButton, locationType === "Auto" && styles.typeButtonActive]} onPress={() => setLocationType("Auto")}>
                            <Ionicons name="location" size={24} color={locationType === "Auto" ? "#fff" : "#3b82f6"} />
                            <Text style={[styles.typeButtonText, locationType === "Auto" && styles.typeTextActive]}>Ubicación Actual</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.typeButton, locationType === "Manual" && styles.typeButtonActive]} onPress={() => setLocationType("Manual")}>
                            <Ionicons name="map" size={24} color={locationType === "Manual" ? "#fff" : "#3b82f6"} />
                            <Text style={[styles.typeButtonText, locationType === "Manual" && styles.typeTextActive]}>Dirección Manual</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {locationType === "Manual" && (
                    <View style={styles.section}>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                            <TextInput style={styles.searchInput} placeholder="Ej: Madrid, Calle Mayor 12..." placeholderTextColor="#94a3b8" />
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.submitButton} onPress={() => setHasSearched(true)}>
                    <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitButtonText}>BUSCAR TALLERES</Text>
                </TouchableOpacity>
            </View>

            {/* RESULTADOS DE BÚSQUEDA */}
            {hasSearched && (
                <View style={styles.resultsContainer}>
                    <Text style={styles.resultsTitle}>Talleres Cercanos</Text>

                    {/* FILTROS */}
                    <View style={styles.filtersWrapper}>
                        <Text style={styles.filterLabel}>Ordenar por:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                            {["Proximidad", "Calificación en Google"].map((ord) => (
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

                    {/* LISTA DE RESULTADOS */}
                    <View style={styles.listContainer}>
                        {MOCK_TALLERES.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => handleOpenMap(item.address)}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name="car-sport" size={28} color="#ef4444" />
                                </View>
                                <View style={styles.resultInfo}>
                                    <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>

                                    <View style={styles.metaRow}>
                                        <View style={styles.distanceBadge}>
                                            <Ionicons name="location" size={12} color="#0284c7" />
                                            <Text style={styles.distanceText}>{item.distance}</Text>
                                        </View>
                                        <View style={styles.ratingBox}>
                                            <Ionicons name="star" size={12} color="#f59e0b" />
                                            <Text style={styles.ratingText}>{item.rating} </Text>
                                            <Text style={styles.reviewsText}>({item.reviews})</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.chevronBox}>
                                    <Ionicons name="navigate-circle-outline" size={28} color="#3b82f6" />
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
    grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    gridButton: {
        width: "48%", backgroundColor: "#ffffff", padding: 12, borderRadius: 10, borderWidth: 1,
        borderColor: "#e2e8f0", alignItems: "center", marginBottom: 12, flexDirection: "row", justifyContent: "center", gap: 6
    },
    gridButtonActive: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
    gridIcon: { marginBottom: 0 },
    gridButtonText: { fontSize: 13, fontWeight: "600", color: "#3b82f6" },
    gridTextActive: { color: "#ffffff" },
    row: { flexDirection: "row", gap: 12 },
    typeButton: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        backgroundColor: "#eff6ff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#bfdbfe", gap: 8
    },
    typeButtonActive: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
    typeButtonText: { fontWeight: "600", color: "#3b82f6", fontSize: 13 },
    typeTextActive: { color: "#ffffff" },
    divider: { height: 1, backgroundColor: "#e2e8f0", marginVertical: 10 },
    searchContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff",
        borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingLeft: 12, paddingRight: 6
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#1e293b" },
    submitButton: {
        backgroundColor: "#ef4444", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10,
        flexDirection: "row", justifyContent: "center"
    },
    submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

    // Results
    resultsContainer: { borderTopWidth: 2, borderTopColor: "#e2e8f0", paddingTop: 20 },
    resultsTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
    filtersWrapper: { marginBottom: 16, gap: 6 },
    filterLabel: { fontSize: 13, fontWeight: "600", color: "#64748b" },
    filterScroll: { gap: 8, paddingRight: 20 },
    filterPill: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
        backgroundColor: "#f1f5f9", borderWidth: 1, borderColor: "#e2e8f0"
    },
    filterPillActive: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
    filterPillText: { fontSize: 13, color: "#64748b", fontWeight: "500" },
    filterPillTextActive: { color: "#ffffff", fontWeight: "bold" },

    listContainer: { gap: 12 },
    resultCard: {
        flexDirection: "row", backgroundColor: "#ffffff", borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: "#e2e8f0", padding: 12, alignItems: "center",
        elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4
    },
    iconContainer: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#fee2e2", justifyContent: "center", alignItems: "center" },
    resultInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
    resultName: { fontSize: 15, fontWeight: "bold", color: "#0f172a", marginBottom: 2 },
    resultAddress: { fontSize: 12, color: "#64748b", marginBottom: 6 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    distanceBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#e0f2fe", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    distanceText: { fontSize: 11, color: "#0284c7", fontWeight: "bold" },
    ratingBox: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    ratingText: { fontSize: 11, color: "#b45309", fontWeight: "bold" },
    reviewsText: { fontSize: 10, color: "#92400e" },
    chevronBox: { paddingLeft: 10 }
});
