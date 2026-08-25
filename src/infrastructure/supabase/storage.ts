import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import { toSecureStoreKey } from "@/src/infrastructure/supabase/secureStoreKey";

const chunkSize = 1800;

export const authStorage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web" && typeof window === "undefined") return null;
    if (Platform.OS === "web") return AsyncStorage.getItem(key);
    const nativeKey = toSecureStoreKey(key);
    const count = Number(await SecureStore.getItemAsync(`${nativeKey}.chunks`));
    if (!Number.isInteger(count) || count < 1) return SecureStore.getItemAsync(nativeKey);
    const chunks = await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${nativeKey}.${index}`)));
    return chunks.every((chunk) => chunk !== null) ? chunks.join("") : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    if (Platform.OS === "web") return AsyncStorage.setItem(key, value);
    const nativeKey = toSecureStoreKey(key);
    await removeNativeItem(nativeKey);
    const chunks = value.match(new RegExp(`.{1,${chunkSize}}`, "gs")) ?? [];
    await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(`${nativeKey}.${index}`, chunk)));
    await SecureStore.setItemAsync(`${nativeKey}.chunks`, String(chunks.length));
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web" && typeof window === "undefined") return;
    if (Platform.OS === "web") return AsyncStorage.removeItem(key);
    await removeNativeItem(toSecureStoreKey(key));
  }
};

async function removeNativeItem(key: string): Promise<void> {
  const count = Number(await SecureStore.getItemAsync(`${key}.chunks`));
  if (Number.isInteger(count) && count > 0) {
    await Promise.all(Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(`${key}.${index}`)));
  }
  await Promise.all([SecureStore.deleteItemAsync(`${key}.chunks`), SecureStore.deleteItemAsync(key)]);
}
