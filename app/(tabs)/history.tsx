import { StyleSheet, Text, View } from "react-native";

export default function HistoryScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Historial</Text>
            <Text style={styles.subtitle}>Registro de intervenciones</Text>
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
