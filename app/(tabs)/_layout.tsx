import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#2563eb",
                tabBarInactiveTintColor: "#64748b",
                headerShown: true,
                tabBarStyle: {
                    backgroundColor: "#ffffff",
                    borderTopWidth: 1,
                    borderTopColor: "#e2e8f0",
                    elevation: 10,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowOffset: { width: 0, height: -2 },
                    shadowRadius: 10,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                headerStyle: {
                    backgroundColor: "#ffffff",
                    elevation: 0,
                    shadowOpacity: 0,
                    borderBottomWidth: 1,
                    borderBottomColor: "#e2e8f0",
                },
                headerTitleStyle: {
                    fontWeight: "bold",
                    color: "#1e293b",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="diagnostico"
                options={{
                    title: "Diagnóstico",
                    tabBarIcon: ({ color, size }) => <Ionicons name="build" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="reparacion"
                options={{
                    title: "Reparación",
                    tabBarIcon: ({ color, size }) => <Ionicons name="construct" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="repuestos"
                options={{
                    title: "Repuestos",
                    tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="herramientas"
                options={{
                    title: "Herramientas",
                    tabBarIcon: ({ color, size }) => <Ionicons name="hammer" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="talleres"
                options={{
                    title: "Talleres",
                    tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="historial"
                options={{
                    title: "Historial",
                    tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
