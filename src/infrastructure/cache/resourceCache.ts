import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

const envelopeSchema = z.object({ version: z.literal(1), storedAt: z.string(), value: z.unknown() });
const prefix = "seednergy.cache.v1";

export function createPublicCacheKey(resource: string): string { return `${prefix}.public.${resource}`; }
export function createPrivateCacheKey(userId: string, resource: string): string { return `${prefix}.user.${userId}.${resource}`; }

export async function readCached<T>(key: string, schema: z.ZodType<T>): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    const envelope = envelopeSchema.parse(JSON.parse(raw));
    return schema.parse(envelope.value);
  } catch {
    await AsyncStorage.removeItem(key);
    return null;
  }
}

export async function writeCached<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify({ version: 1, storedAt: new Date().toISOString(), value }));
}

export async function clearPrivateCache(userId: string): Promise<void> {
  const userPrefix = `${prefix}.user.${userId}.`;
  const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(userPrefix));
  if (keys.length) await AsyncStorage.multiRemove(keys);
}
