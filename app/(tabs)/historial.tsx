import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { clearSearchHistory, getSearchHistory, SearchHistoryItem } from "../utils/history";

export default function Historial() {
    const [history, setHistory] = useState<SearchHistoryItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadHistory();
        }, [])
    );

    const loadHistory = async () => {
        const data = await getSearchHistory();
        setHistory(data);
    };

    const handleClear = async () => {
        await clearSearchHistory();
        setHistory([]);
    };

    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>

                <Text style={styles.header}>Tus búsquedas recientes</Text>

                {history.length === 0 ? (
                    <View style={{ padding: 20, alignItems: "center" }}>
                        <Ionicons name="time-outline" size={48} color="#cbd5e1" />
                        <Text style={{ marginTop: 12, color: "#64748b", fontSize: 16 }}>No hay búsquedas recientes.</Text>
                    </View>
                ) : (
                    <>
                        {history.map((item) => (
                            <TouchableOpacity key={item.id} style={styles.historyCard}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={item.icon as any} size={24} color="#64748b" />
                                </View>
                                <View style={styles.textContent}>
                                    <Text style={styles.category}>{item.category}</Text>
                                    <Text style={styles.detail}>{item.detail}</Text>
                                </View>
                                <Text style={styles.date}>{formatDate(item.date)}</Text>
                            </TouchableOpacity>
                        ))}

                        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                            <Text style={styles.clearButtonText}>Limpiar historial</Text>
                        </TouchableOpacity>
                    </>
                )}

            </ScrollView>
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
    header: { fontSize: 18, fontWeight: "bold", color: "#1e293b", marginBottom: 20 },
    historyCard: {
        flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff",
        padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#e2e8f0",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
    },
    iconContainer: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: "#f1f5f9",
        justifyContent: "center", alignItems: "center", marginRight: 16
    },
    textContent: { flex: 1 },
    category: { fontSize: 13, color: "#64748b", fontWeight: "600", textTransform: "uppercase", marginBottom: 4 },
    detail: { fontSize: 15, color: "#1e293b", fontWeight: "500" },
    date: { fontSize: 12, color: "#94a3b8", alignSelf: "flex-start", marginTop: 4 },
    clearButton: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        marginTop: 24, paddingVertical: 12, gap: 8
    },
    clearButtonText: { color: "#ef4444", fontWeight: "600", fontSize: 16 }
});
