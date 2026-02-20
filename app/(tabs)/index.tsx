import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const MENU_ITEMS = [
    { href: "/diagnostico", title: "DIAGNÓSTICO", icon: "build-outline", desc: "Síntomas y averías" },
    { href: "/reparacion", title: "REPARACIÓN", icon: "construct-outline", desc: "Tutoriales y guías" },
    { href: "/repuestos", title: "REPUESTOS", icon: "settings-outline", desc: "Compra de piezas" },
    { href: "/herramientas", title: "HERRAMIENTAS", icon: "hammer-outline", desc: "Equipamiento" },
    { href: "/talleres", title: "TALLERES", icon: "car-outline", desc: "Servicios profesionales" },
    { href: "/historial", title: "HISTORIAL", icon: "time-outline", desc: "Búsquedas recientes" },
];

export default function Home() {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.welcomeText}>¿Qué necesitas hoy?</Text>

            <View style={styles.grid}>
                {MENU_ITEMS.map((item, index) => (
                    <Link href={item.href as any} key={index} asChild>
                        <TouchableOpacity style={styles.card} activeOpacity={0.8}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={item.icon as any} size={40} color="#3b82f6" />
                            </View>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.desc}</Text>
                        </TouchableOpacity>
                    </Link>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 24,
        textAlign: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%",
        backgroundColor: "#ffffff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    iconContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#eff6ff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: 8,
        textAlign: "center",
    },
    cardDesc: {
        fontSize: 12,
        color: "#64748b",
        textAlign: "center",
    }
});
