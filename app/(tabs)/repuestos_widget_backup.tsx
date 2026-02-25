import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import GoogleSearchWidget from "../components/GoogleSearchWidget";

export default function Repuestos() {
    const [hasSearched, setHasSearched] = useState(false);
    const [vehicleQuery, setVehicleQuery] = useState("");
    const [itemQuery, setItemQuery] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = () => {
        if (!vehicleQuery.trim() || !itemQuery.trim()) {
            alert("Por favor, rellena el vehículo y el repuesto que buscas.");
            return;
        }

        setIsLoading(true);
        setHasSearched(false);

        // Timeout para UX y garantizar remontaje del componente
        setTimeout(() => {
            setIsLoading(false);
            setHasSearched(true);
        }, 500);
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
                    {/* RESULTADOS EMPOTRADOS (WIDGET DE GOOGLE) */}
                    <View style={styles.listContainer}>
                        <GoogleSearchWidget query={`comprar ${itemQuery} para ${vehicleQuery}`} />
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
    listContainer: { gap: 12, marginTop: 10 }
});
