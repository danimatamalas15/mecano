import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@mecano_search_history';

export interface SearchHistoryItem {
    id: string;
    category: string; // "Reparación" | "Diagnóstico" | "Repuestos" | "Talleres"
    detail: string;
    date: string;     // ISO string format
    icon: string;     // Ionicons name (e.g. "construct", "build", "settings", "car")
}

export const saveSearchToHistory = async (category: string, detail: string, icon: string) => {
    try {
        const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
        let history: SearchHistoryItem[] = storedHistory ? JSON.parse(storedHistory) : [];

        // No duplicar busquedas idénticas
        history = history.filter(item => !(item.category === category && item.detail.toLowerCase() === detail.toLowerCase()));

        const newItem: SearchHistoryItem = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            category,
            detail,
            date: new Date().toISOString(),
            icon
        };

        // Insert at the beginning, limit to 20
        history.unshift(newItem);
        if (history.length > 20) {
            history = history.slice(0, 20);
        }

        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Error saving search history", e);
    }
};

export const getSearchHistory = async (): Promise<SearchHistoryItem[]> => {
    try {
        const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
        return storedHistory ? JSON.parse(storedHistory) : [];
    } catch (e) {
        console.error("Error getting search history", e);
        return [];
    }
};

export const clearSearchHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.error("Error clearing search history", e);
    }
};
