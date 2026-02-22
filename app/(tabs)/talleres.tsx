import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import { useState } from "react";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type TallerType = "Mecánica" | "Chapa" | "Electrónica" | "Neumáticos";

// Mock Data Dinámico

// Fórmula Haversine para calcular distancia en km entre dos coordenadas
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function Talleres() {

    const [tallerType, setTallerType] = useState<TallerType | null>(null);
    const [locationType, setLocationType] = useState<"Auto" | "Manual" | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [orderFilter, setOrderFilter] = useState<"Proximidad" | "Calificación en Google">("Proximidad");

    const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [manualAddress, setManualAddress] = useState("");
    const [searchCenter, setSearchCenter] = useState<{ lat: number, lon: number } | null>(null);
    const [mockResults, setMockResults] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!locationType) {
            alert("Por favor, selecciona el método de ubicación.");
            return;
        }

        setIsLoadingLocation(true);
        setLocationError("");
        setHasSearched(false);

        let center: { lat: number, lon: number } | null = null;

        try {
            if (locationType === "Auto") {
                if (!userLocation) {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        setLocationError("Permiso de ubicación denegado. Prueba con búsqueda manual.");
                        setIsLoadingLocation(false);
                        return;
                    }
                    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                    center = { lat: location.coords.latitude, lon: location.coords.longitude };
                    setUserLocation(center);
                } else {
                    center = userLocation;
                }
            } else if (locationType === "Manual") {
                if (!manualAddress.trim()) {
                    setLocationError("Por favor, introduce una dirección válida para buscar.");
                    setIsLoadingLocation(false);
                    return;
                }
                const geocodeResults = await Location.geocodeAsync(manualAddress);
                if (geocodeResults.length > 0) {
                    center = { lat: geocodeResults[0].latitude, lon: geocodeResults[0].longitude };
                } else {
                    setLocationError("No pudimos encontrar esa dirección. Sé más específico.");
                    setIsLoadingLocation(false);
                    return;
                }
            }

            if (center) {
                setSearchCenter(center);
                const currentCenter = center;
                try {
                    // Detectar base URL dinámicamente según el entorno para Vercel o local
                    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
                    const apiUrl = `${baseUrl}/api/talleres?lat=${currentCenter.lat}&lng=${currentCenter.lon}&tipo=${tallerType || ''}`;

                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();

                    if (response.ok && Array.isArray(data)) {
                        const mappedResults = data.map((place: any, index: number) => ({
                            id: place.place_id || String(index),
                            name: place.name,
                            address: place.vicinity || place.formatted_address || "Dirección no disponible",
                            lat: place.geometry?.location?.lat || currentCenter.lat,
                            lon: place.geometry?.location?.lng || currentCenter.lon,
                            rating: place.rating ? place.rating.toFixed(1) : "N/A",
                            reviews: place.user_ratings_total || 0,
                            type: tallerType || "Mecánica",
                            url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}&query_place_id=${place.place_id}`
                        }));
                        setMockResults(mappedResults);
                    } else {
                        setMockResults([]);
                        setLocationError(data.error || "No se encontraron talleres.");
                    }
                } catch (error: any) {
                    console.error("Error fetching talleres:", error);
                    setLocationError(`Fallo de conexión: ${error.message || "Error al contactar con el servidor."}`);
                }
                setOrderFilter("Proximidad");
                setHasSearched(true);
            }
        } catch (error) {
            setLocationError("Ocurrió un error al procesar la ubicación.");
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const TALLERES: { type: TallerType; icon: any }[] = [
        { type: "Mecánica", icon: "hardware-chip-outline" },
        { type: "Chapa", icon: "color-fill-outline" },
        { type: "Electrónica", icon: "flash-outline" },
        { type: "Neumáticos", icon: "disc-outline" },
    ];

    const handleOpenMap = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Error al abrir mapa", err));
    };

    const StarRating = ({ rating }: { rating: string }) => {
        const numRating = parseFloat(rating);
        return (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name={star <= numRating ? "star" : star - 0.5 <= numRating ? "star-half" : "star-outline"}
                        size={12}
                        color="#f59e0b"
                    />
                ))}
            </View>
        );
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
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Ej: Madrid, Calle Mayor 12..."
                                placeholderTextColor="#94a3b8"
                                value={manualAddress}
                                onChangeText={setManualAddress}
                            />
                        </View>
                    </View>
                )}

                {locationError ? <Text style={styles.errorText}>{locationError}</Text> : null}

                <TouchableOpacity style={styles.submitButton} onPress={handleSearch} disabled={isLoadingLocation}>
                    {isLoadingLocation ? (
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    ) : (
                        <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                    )}
                    <Text style={styles.submitButtonText}>{isLoadingLocation ? "BUSCANDO..." : "BUSCAR TALLERES"}</Text>
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
                        {
                            mockResults
                                .map((taller) => {
                                    const distKm = searchCenter ? calculateDistance(searchCenter.lat, searchCenter.lon, taller.lat, taller.lon) : 0;
                                    return { ...taller, distValue: distKm, distanceText: distKm.toFixed(1) + " km" };
                                })
                                // Ordenar
                                .sort((a, b) => {
                                    if (orderFilter === "Proximidad") {
                                        return a.distValue - b.distValue;
                                    } else {
                                        return parseFloat(b.rating) - parseFloat(a.rating);
                                    }
                                })
                                .map((item) => (
                                    <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => handleOpenMap(item.url)}>
                                        <View style={styles.iconContainer}>
                                            <Ionicons name="car-sport" size={28} color="#ef4444" />
                                        </View>
                                        <View style={styles.resultInfo}>
                                            <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                                            <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>

                                            <View style={styles.metaRow}>
                                                <View style={styles.distanceBadge}>
                                                    <Ionicons name="location" size={12} color="#0284c7" />
                                                    <Text style={styles.distanceText}>{item.distanceText}</Text>
                                                </View>
                                                <View style={styles.ratingBox}>
                                                    <Text style={styles.ratingText}>{item.rating} </Text>
                                                    <StarRating rating={item.rating} />
                                                    <Text style={styles.reviewsText}>({item.reviews})</Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={styles.chevronBox}>
                                            <Ionicons name="navigate-circle-outline" size={28} color="#3b82f6" />
                                        </View>
                                    </TouchableOpacity>
                                ))
                        }
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
    errorText: { color: "#dc2626", fontSize: 13, marginTop: 4, marginBottom: 8, textAlign: "center" },

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
