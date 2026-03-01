import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { fetchChatGPTResponse } from "../services/openai";
import { fetchYouTubeVideos, YouTubeVideo } from "../services/youtube";
import { saveSearchToHistory } from "../utils/history";

import { Picker } from '@react-native-picker/picker';

export default function Reparacion() {
    const [vehicleType, setVehicleType] = useState<"Auto" | "Moto" | null>(null);
    const [formData, setFormData] = useState({
        marca: '',
        modelo: '',
        version: '',
        motor: '',
        ano: ''
    });
    const [repairQuery, setRepairQuery] = useState("");
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string[]>([]);
    const [mockVideos, setMockVideos] = useState<YouTubeVideo[]>([]);
    const [forums, setForums] = useState<any[]>([]);

    const handleSearch = async () => {
        if (!repairQuery.trim()) {
            alert("Por favor, introduce la reparación deseada.");
            return;
        }

        const vehicleStr = `${formData.marca} ${formData.modelo} ${formData.version} ${formData.motor} ${formData.ano}`.trim();

        setIsLoading(true);
        setHasSearched(false);

        try {
            const prompt = `Eres un mecánico experto e instructor paso a paso avanzado.
Vehículo cliente: ${vehicleType === 'Moto' ? 'Motocicleta' : 'Automóvil'} - ${vehicleStr}
Reparación a realizar: ${repairQuery}

Instrucciones: Analiza meticulosamente el modelo específico del vehículo y la reparación solicitada. Proporciona una guía exhaustiva y sumamente detallada. Tu respuesta debe incluir:
1. Una introducción técnica profundizando en las especificaciones, cuidados y herramientas necesarias para esta reparación en este modelo específico.
2. Un listado extenso paso a paso, detallado a nivel técnico y ordenado cronológicamente.
3. Consejos de seguridad y prevenciones de errores comunes durante el desmontaje y ensamblaje.
Sé muy preciso, analítico y exhaustivo. NO uses negritas ni sintaxis markdown compleja, guíate por saltos de línea y viñetas simples (-) o números (1., 2., ...).`;

            const queryType = vehicleType === 'Moto' ? 'motocicleta' : 'automóvil';
            const youtubeQuery = `${queryType} ${vehicleStr} cómo reparar o cambiar ${repairQuery.trim()}`;

            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const urlForos = `${baseUrl}/api/foros?q=${encodeURIComponent(youtubeQuery)}`;

            const [result, videosData, forosRes] = await Promise.all([
                fetchChatGPTResponse(prompt),
                fetchYouTubeVideos(queryType, vehicleStr, repairQuery.trim()),
                fetch(urlForos)
            ]);

            const forosData = await forosRes.json();

            setAiResponse(result);
            setMockVideos(videosData);

            if (forosData && forosData.items) {
                setForums(forosData.items);
            } else {
                setForums([]);
            }
            setHasSearched(true);

            // Guardar historial
            saveSearchToHistory("Reparación", `${vehicleStr}: ${repairQuery.trim()}`.substring(0, 60), "construct");

        } catch (error) {
            console.error("Error en reparacion:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert(`Error al contactar con la IA para obtener la guía de reparación. Detalle: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };



    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) => console.error("Error abriendo URL: ", err));
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText3D}>iAUTO-BOX</Text>
                    </View>

                    {/* FORMULARIO */}
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

                        <View style={styles.sectionContainer}>
                            <Text style={styles.label}>2. Vehículo (Marca, Modelo, Versión, Motor, Año)</Text>
                            <View style={styles.gridContainer}>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Marca</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker selectedValue={formData.marca} onValueChange={(itemValue) => setFormData({ ...formData, marca: itemValue })}>
                                            <Picker.Item label="Cualquiera" value="" />
                                            <Picker.Item label="Toyota" value="Toyota" />
                                            <Picker.Item label="Honda" value="Honda" />
                                            <Picker.Item label="Ford" value="Ford" />
                                            <Picker.Item label="Volkswagen" value="Volkswagen" />
                                            <Picker.Item label="Renault" value="Renault" />
                                            <Picker.Item label="Peugeot" value="Peugeot" />
                                            <Picker.Item label="SEAT" value="SEAT" />
                                            <Picker.Item label="BMW" value="BMW" />
                                            <Picker.Item label="Mercedes" value="Mercedes-Benz" />
                                            <Picker.Item label="Audi" value="Audi" />
                                        </Picker>
                                    </View>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Modelo</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker selectedValue={formData.modelo} onValueChange={(itemValue) => setFormData({ ...formData, modelo: itemValue })}>
                                            <Picker.Item label="Cualquiera" value="" />
                                            {/* Opciones genéricas, se pueden volver dependientes de la marca en el futuro */}
                                            <Picker.Item label="Corolla" value="Corolla" />
                                            <Picker.Item label="Civic" value="Civic" />
                                            <Picker.Item label="Focus" value="Focus" />
                                            <Picker.Item label="Golf" value="Golf" />
                                            <Picker.Item label="Leon" value="Leon" />
                                            <Picker.Item label="Clio" value="Clio" />
                                            <Picker.Item label="208" value="208" />
                                            <Picker.Item label="Ibiza" value="Ibiza" />
                                            <Picker.Item label="A3" value="A3" />
                                            <Picker.Item label="Serie 3" value="Serie 3" />
                                        </Picker>
                                    </View>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Versión</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker selectedValue={formData.version} onValueChange={(itemValue) => setFormData({ ...formData, version: itemValue })}>
                                            <Picker.Item label="Cualquiera" value="" />
                                            <Picker.Item label="Base" value="Base" />
                                            <Picker.Item label="GTI" value="GTI" />
                                            <Picker.Item label="ST" value="ST" />
                                            <Picker.Item label="RS" value="RS" />
                                            <Picker.Item label="FR" value="FR" />
                                        </Picker>
                                    </View>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Motor</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker selectedValue={formData.motor} onValueChange={(itemValue) => setFormData({ ...formData, motor: itemValue })}>
                                            <Picker.Item label="Cualquiera" value="" />
                                            <Picker.Item label="1.0 TSI" value="1.0 TSI" />
                                            <Picker.Item label="1.2 PureTech" value="1.2 PureTech" />
                                            <Picker.Item label="1.4 TFSI" value="1.4 TFSI" />
                                            <Picker.Item label="1.5 dCi" value="1.5 dCi" />
                                            <Picker.Item label="1.6 TDI" value="1.6 TDI" />
                                            <Picker.Item label="1.8 Híbrido" value="1.8 Híbrido" />
                                            <Picker.Item label="2.0 TDI" value="2.0 TDI" />
                                            <Picker.Item label="2.0 TSI" value="2.0 TSI" />
                                        </Picker>
                                    </View>
                                </View>
                                <View style={styles.gridItem}>
                                    <Text style={styles.gridLabel}>Año</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker selectedValue={formData.ano} onValueChange={(itemValue) => setFormData({ ...formData, ano: itemValue })}>
                                            <Picker.Item label="Cualquiera" value="" />
                                            {[...Array(25)].map((_, i) => {
                                                const year = (new Date().getFullYear() - i).toString();
                                                return <Picker.Item key={year} label={year} value={year} />;
                                            })}
                                        </Picker>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>3. ¿Qué reparación deseas realizar?</Text>
                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Ej: Cambio de aceite y filtros..."
                                    placeholderTextColor="#94a3b8"
                                    multiline={true}
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                    value={repairQuery}
                                    onChangeText={setRepairQuery}
                                />
                                <TouchableOpacity style={styles.voiceButton}>
                                    <Ionicons name="mic" size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleSearch}>
                            <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
                            <Text style={styles.submitButtonText}>BUSCAR REPARACIÓN</Text>
                        </TouchableOpacity>
                    </View>

                    {/* INDICADOR DE CARGA */}
                    {isLoading && (
                        <View style={{ padding: 30, alignItems: "center" }}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={{ marginTop: 10, color: "#64748b" }}>Generando guía con ChatGPT...</Text>
                        </View>
                    )}

                    {/* RESULTADOS DE BÚSQUEDA */}
                    {hasSearched && (
                        <View style={styles.resultsContainer}>
                            <View style={styles.resultsHeader}>
                                <Text style={styles.resultsTitle}>Tutoriales y Guías</Text>
                            </View>

                            <View style={{ flexDirection: 'column', gap: 30 }}>

                                {/* 1. SECCIÓN AI */}
                                <View style={styles.iaCard}>
                                    <View style={styles.iaHeader}>
                                        <Ionicons name="sparkles" size={20} color="#0284c7" />
                                        <Text style={styles.iaTitle}>Paso a Paso por ChatGPT</Text>
                                    </View>

                                    {aiResponse.map((line, index) => (
                                        <Text key={index} style={index === 0 ? styles.iaText : styles.iaBullet}>
                                            {line}
                                        </Text>
                                    ))}

                                    <Image source={{ uri: 'https://images.unsplash.com/photo-1625067204646-7c0134dddfa3?q=80&w=400' }} style={styles.iaImage} />
                                    <Text style={styles.iaImageCaption}>Ubicación típica del arreglo.</Text>
                                </View>

                                {/* 2. SECCIÓN FOROS (Si hay) */}
                                {forums.length > 0 && (
                                    <View style={styles.forumsSection}>
                                        <Text style={styles.sectionSubtitle}>Tutoriales en Foros y Webs</Text>

                                        {forums.map((forum, index) => (
                                            <TouchableOpacity key={`forum-${index}`} style={styles.forumCard} onPress={() => openLink(forum.link)}>
                                                <Ionicons name="document-text" size={24} color="#3b82f6" />
                                                <View style={styles.forumInfo}>
                                                    <Text style={styles.forumTitle} numberOfLines={2}>{forum.title}</Text>
                                                    <Text style={styles.forumMeta} numberOfLines={1}>{forum.displayLink}</Text>
                                                    <View style={styles.badgeForum}>
                                                        <Text style={styles.badgeTextForum}>Foro / Web</Text>
                                                    </View>
                                                </View>
                                                <Ionicons name="open-outline" size={20} color="#94a3b8" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* 3. YOUTUBE VIDEOS (Si hay) */}
                                {mockVideos.length > 0 && (
                                    <View style={styles.videosSection}>
                                        <Text style={styles.sectionSubtitle}>{mockVideos.length} Vídeos Relacionados con tu vehículo</Text>
                                        {mockVideos.map(video => {
                                            const cardContent = (
                                                <>
                                                    <Image source={{ uri: video.image }} style={styles.videoThumbnail} />
                                                    <View style={styles.videoInfo}>
                                                        <Text style={styles.videoTitle}>{video.title}</Text>
                                                        <Text style={styles.videoMeta}>{video.views}</Text>
                                                        <View style={styles.badge}>
                                                            <Text style={styles.badgeText}>{video.lang}</Text>
                                                        </View>
                                                    </View>
                                                </>
                                            );

                                            if (Platform.OS === 'web') {
                                                return (
                                                    <a
                                                        key={video.id}
                                                        href={video.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ textDecoration: 'none', display: 'flex' }}
                                                    >
                                                        <View style={[styles.videoCard, { flex: 1 }]}>
                                                            {cardContent}
                                                        </View>
                                                    </a>
                                                );
                                            }

                                            return (
                                                <TouchableOpacity key={video.id} style={styles.videoCard} onPress={() => openLink(video.url)}>
                                                    {cardContent}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#f8fafc",
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    container: { flex: 1, backgroundColor: "#f8fafc" },
    content: { padding: 20, paddingBottom: 40 },
    logoContainer: {
        alignItems: "center",
        marginTop: 0,
        marginBottom: 24,
    },
    logoText3D: {
        fontSize: 32,
        fontWeight: "900",
        color: "#2563eb",
        letterSpacing: 2,
        textShadowColor: "#1e3a8a",
        textShadowOffset: { width: 2, height: 3 },
        textShadowRadius: 1,
        transform: [{ perspective: 500 }, { rotateX: '10deg' }],
    },
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
        backgroundColor: "#3b82f6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 10,
        flexDirection: "row", justifyContent: "center"
    },
    submitButtonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

    // Pickers Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    gridItem: {
        width: '48%',
        marginBottom: 12,
    },
    gridLabel: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 4,
        fontWeight: '500'
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        overflow: 'hidden'
    },
    sectionContainer: {
        marginBottom: 20,
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },

    // Results
    resultsContainer: {
        borderTopWidth: 2, borderTopColor: "#e2e8f0", paddingTop: 20
    },
    resultsHeader: { marginBottom: 16 },
    resultsTitle: { fontSize: 18, fontWeight: "bold", color: "#0f172a", marginBottom: 16 },
    forumsToggleButton: {
        backgroundColor: "#0ea5e9", borderRadius: 8, padding: 14,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8
    },
    forumsToggleText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
    aiAndVideos: { gap: 20 },
    iaCard: {
        backgroundColor: "#f0f9ff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#bae6fd"
    },
    iaHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    iaTitle: { fontSize: 16, fontWeight: "bold", color: "#0369a1" },
    iaText: { fontSize: 14, color: "#0c4a6e", marginBottom: 8, lineHeight: 20 },
    iaBullet: { fontSize: 14, color: "#0c4a6e", marginBottom: 4, marginLeft: 8 },
    iaImage: { width: "100%", height: 160, borderRadius: 8, marginTop: 12 },
    iaImageCaption: { fontSize: 12, color: "#0284c7", marginTop: 8, fontStyle: "italic", textAlign: "center" },

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
