import { StyleSheet, Text, View } from "react-native";

export default function ToolsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Herramientas</Text>
            <Text style={styles.subtitle}>Inventario y utilidades necesarias</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
    },
});
