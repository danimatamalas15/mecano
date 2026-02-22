import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { fetchChatGPTResponse } from "../services/openai";

// Mock Data
const MOCK_VIDEOS = [
    { id: "1", title: "Cómo identificar fallos de encendido", views: "1.2M visualizaciones", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200", lang: "Español" },
    { id: "2", title: "Engine Misfire Diagnosis (Subtítulos en Español)", views: "850K visualizaciones", image: "https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=200", lang: "Inglés - Auto Traducido" },
    { id: "3", title: "Limpieza de inyectores paso a paso", views: "500K visualizaciones", image: "https://images.unsplash.com/photo-1530906358829-e84b2769270f?q=80&w=200", lang: "Español" }
];

const MOCK_FORUMS = [
    { id: "1", title: "Solucionado: Check Engine parpadea al acelerar", source: "ForoMecanicos.com", date: "Hace 2 semanas", lang: "Español" },
    { id: "2", title: "Common issues with spark plugs", source: "CarTalk Forums", date: "Hace 1 mes", lang: "Inglés - Traducido automáticamente" },
    { id: "3", title: "Guía de códigos OBD2 y qué significan", source: "Comunidad Motor", date: "Hace 3 meses", lang: "Español" }
];

export default function Diagnostico() {
    const [vehicleType, setVehicleType] = useState<"Auto" | "Moto" | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [showForums, setShowForums] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [symptoms, setSymptoms] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string[]>([]);

    const handleSearch = async () => {
        if (!searchQuery.trim() || !symptoms.trim()) {
            alert("Por favor, indica los datos del vehículo y los síntomas experimentados para proceder.");
            return;
        }

        setIsLoading(true);
        setHasSearched(false);
        setShowForums(false);

        try {
            const prompt = `Eres un mecánico experto en diagnóstico automotriz (IA avanzada). 
El vehículo es un: ${vehicleType === 'Moto' ? 'Motocicleta' : 'Automóvil'} - ${searchQuery}
Los síntomas descritos son: ${symptoms}

Comporta tu respuesta devolviendo: un primer párrafo introductorio de diagnóstico general, seguido de una pequeña lista de 3 viñetas separadas por saltos de línea con las fallas más probables y cómo detectarlas. Sé preciso, técnico pero entendible y NO uses negritas/asteriscos de markdown.`;

            const result = await fetchChatGPTResponse(prompt);
            setAiResponse(result);
            setHasSearched(true);
        } catch (error) {
            console.error("Error en diagnostico:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Hubo un error en nuestro servidor de diagnóstico de ChatGPT. Detalle: ${errorMessage}. Reintente más tarde.`);
        } finally {
            setIsLoading(false);
        }
    };

    const openLink = (url: string) => {
        // Simulated external app opening
        alert(`Abriendo navegador externo/YouTube:\n${url}`);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                {/* FORMULARIO DE BÚSQUEDA */}
                <View style={styles.formContainer}>
                    <View style={styles.section}>
                        <Text style={styles.label}>1. Tipo de Vehículo</Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.typeButton, vehicleType === "Auto" && styles.typeButtonActive]} onPress={() => setVehicleType("Auto")}>
                                <Ionicons name="car-outline" size={24} color={vehicleType === "Auto" ? "#fff" : "#3b82f6"} />
                                <Text style={[styles.typeButtonText, vehicleType === "Auto" && styles.typeTextActive]}>Automóvil</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.typeButton, vehicleType === "Moto" && styles.typeButtonActive]} onPress={() => setVehicleType("Moto")}>
                                <Ionicons name="bicycle-outline" size={24} color={vehicleType === "Moto" ? "#fff" : "#3b82f6"} />
                                <Text style={[styles.typeButtonText, vehicleType === "Moto" && styles.typeTextActive]}>Motocicleta</Text>
                            </TouchableOpacity>
                        </View>
                    </View>



                    <View style={styles.section}>
                        <Text style={styles.label}>2. Vehículo - en este orden: Marca - Modelo - Versión - Motor - Año fabricación</Text>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={20} color="#94a3b8" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Ej: Toyota Corolla 2018..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.label}>3. Describe el problema o síntomas</Text>
                        <View style={styles.textAreaContainer}>
                            <TextInput
                                style={styles.textArea}
                                placeholder="El coche da tirones al acelerar en segunda marcha..."
                                placeholderTextColor="#94a3b8"
                                multiline={true}
                                numberOfLines={4}
                                textAlignVertical="top"
                                value={symptoms}
                                onChangeText={setSymptoms}
                            />
                            <TouchableOpacity style={styles.voiceButton}>
                                <Ionicons name="mic" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
                        <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.submitButtonText}>BUSCAR DIAGNÓSTICO</Text>
                    </TouchableOpacity>
                </View>

                {/* INDICADOR DE CARGA */}
                {isLoading && (
                    <View style={{ padding: 30, alignItems: "center" }}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={{ marginTop: 10, color: "#64748b" }}>Analizando diagnóstico con ChatGPT...</Text>
                    </View>
                )}

                {/* RESULTADOS DE BÚSQUEDA */}
                {hasSearched && (
                    <View style={styles.resultsContainer}>
                        <View style={styles.resultsHeader}>
                            <Text style={styles.resultsTitle}>Resultados Encontrados</Text>
                            <TouchableOpacity
                                style={styles.forumsToggleButton}
                                onPress={() => setShowForums(!showForums)}
                            >
                                <Ionicons name={showForums ? "bulb" : "earth"} size={18} color="#fff" />
                                <Text style={styles.forumsToggleText}>
                                    {showForums ? "VER DIAGNÓSTICO CHATGPT Y VIDEOS" : "BUSCAR TUTORIALES EN FOROS Y WEBS"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {!showForums ? (
                            <View style={styles.aiAndVideos}>
                                {/* GEMINI 3.1 RESPONSE */}
                                <View style={styles.iaCard}>
                                    <View style={styles.iaHeader}>
                                        <Ionicons name="sparkles" size={20} color="#8b5cf6" />
                                        <Text style={styles.iaTitle}>Diagnóstico por ChatGPT</Text>
                                    </View>

                                    {aiResponse.map((line, index) => (
                                        <Text key={index} style={index === 0 ? styles.iaText : styles.iaBullet}>
                                            {line}
                                        </Text>
                                    ))}

                                    <Image
                                        source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400' }}
                                        style={styles.iaImage}
                                    />
                                    <Text style={styles.iaImageCaption}>Diagrama común del sistema de inyección y bobinas.</Text>
                                </View>

                                {/* YOUTUBE VIDEOS */}
                                <View style={styles.videosSection}>
                                    <Text style={styles.sectionSubtitle}>Vídeos de YouTube Relacionados</Text>
                                    {MOCK_VIDEOS.map(video => (
                                        <TouchableOpacity
                                            key={video.id}
                                            style={styles.videoCard}
                                            onPress={() => openLink(`https://youtube.com/watch?v=mock_video_${video.id}`)}
                                        >
                                            <Image source={{ uri: video.image }} style={styles.videoThumbnail} />
                                            <View style={styles.videoInfo}>
                                                <Text style={styles.videoTitle}>{video.title}</Text>
                                                <Text style={styles.videoMeta}>{video.views}</Text>
                                                <View style={styles.badge}>
                                                    <Text style={styles.badgeText}>{video.lang}</Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View style={styles.forumsSection}>
                                <Text style={styles.sectionSubtitle}>Tutoriales en Foros y Webs</Text>
                                {MOCK_FORUMS.map(forum => (
                                    <TouchableOpacity
                                        key={forum.id}
                                        style={styles.forumCard}
                                        onPress={() => openLink(`https://forum.com/post/${forum.id}`)}
                                    >
                                        <Ionicons name="document-text" size={24} color="#3b82f6" />
                                        <View style={styles.forumInfo}>
                                            <Text style={styles.forumTitle}>{forum.title}</Text>
                                            <Text style={styles.forumMeta}>{forum.source} • {forum.date}</Text>
                                            <View style={styles.badgeForum}>
                                                <Text style={styles.badgeTextForum}>{forum.lang}</Text>
                                            </View>
                                        </View>
                                        <Ionicons name="open-outline" size={20} color="#94a3b8" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    content: { padding: 20, paddingBottom: 40 },
    formContainer: { marginBottom: 20 },
    section: { marginBottom: 16 },
    label: { fontSize: 15, fontWeight: "600", color: "#1e293b", marginBottom: 8 },
    row: { flexDirection: "row", gap: 12 },
    typeButton: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        backgroundColor: "#eff6ff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#bfdbfe", gap: 8
    },
    typeButtonActive: { backgroundColor: "#3b82f6", borderColor: "#2563eb" },
    typeButtonText: { fontWeight: "600", color: "#3b82f6", fontSize: 13 },
    typeTextActive: { color: "#ffffff" },
    dropdown: {
        backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
        padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center"
    },
    dropdownText: { color: "#64748b", fontSize: 14 },
    searchContainer: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff",
        borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, paddingHorizontal: 12
    },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: "#1e293b" },
    textAreaContainer: { position: "relative" },
    textArea: {
        backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10,
        padding: 14, fontSize: 14, color: "#1e293b", minHeight: 100
    },
    voiceButton: {
        position: "absolute", bottom: 10, right: 10, backgroundColor: "#ef4444",
        width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4
    },
    submitButton: {
        backgroundColor: "#10b981", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10,
        flexDirection: "row", justifyContent: "center"
    },
    submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

    // Results
    resultsContainer: {
        borderTopWidth: 2, borderTopColor: "#e2e8f0", paddingTop: 20
    },
    resultsHeader: { marginBottom: 16 },
    resultsTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
    forumsToggleButton: {
        backgroundColor: "#4f46e5", borderRadius: 8, padding: 14,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8
    },
    forumsToggleText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    aiAndVideos: { gap: 20 },
    iaCard: {
        backgroundColor: "#f5f3ff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#ddd6fe"
    },
    iaHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    iaTitle: { fontSize: 16, fontWeight: "bold", color: "#5b21b6" },
    iaText: { fontSize: 14, color: "#4c1d95", marginBottom: 8, lineHeight: 20 },
    iaBullet: { fontSize: 14, color: "#4c1d95", marginBottom: 4, marginLeft: 8 },
    iaImage: { width: "100%", height: 160, borderRadius: 8, marginTop: 12 },
    iaImageCaption: { fontSize: 12, color: "#6d28d9", marginTop: 8, fontStyle: "italic", textAlign: "center" },

    videosSection: { gap: 12 },
    sectionSubtitle: { fontSize: 16, fontWeight: "bold", color: "#1e293b", marginBottom: 4 },
    videoCard: {
        flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden",
        borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4
    },
    videoThumbnail: { width: 120, height: 90 },
    videoInfo: { flex: 1, padding: 10, justifyContent: "center" },
    videoTitle: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
    videoMeta: { fontSize: 12, color: "#64748b", marginBottom: 6 },
    badge: { backgroundColor: "#e0e7ff", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeText: { fontSize: 10, color: "#4338ca", fontWeight: "600" },

    forumsSection: { gap: 12 },
    forumCard: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12,
        borderWidth: 1, borderColor: "#e2e8f0", padding: 16, gap: 12, elevation: 1
    },
    forumInfo: { flex: 1 },
    forumTitle: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginBottom: 4 },
    forumMeta: { fontSize: 12, color: "#64748b", marginBottom: 6 },
    badgeForum: { backgroundColor: "#fef3c7", alignSelf: "flex-start", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    badgeTextForum: { fontSize: 10, color: "#b45309", fontWeight: "600" }
});
