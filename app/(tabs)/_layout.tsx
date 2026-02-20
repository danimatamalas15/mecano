import { Tabs } from "expo-router";

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: "blue", headerShown: true }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                }}
            />
            <Tabs.Screen
                name="diagnosis"
                options={{
                    title: "Diagnóstico",
                }}
            />
            <Tabs.Screen
                name="repair"
                options={{
                    title: "Reparación",
                }}
            />
            <Tabs.Screen
                name="spare-parts"
                options={{
                    title: "Recambios",
                }}
            />
            <Tabs.Screen
                name="tools"
                options={{
                    title: "Herramientas",
                }}
            />
            <Tabs.Screen
                name="workshops"
                options={{
                    title: "Talleres",
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "Historial",
                }}
            />
        </Tabs>
    );
}
