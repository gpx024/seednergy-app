import { useCallback, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { profileRepository } from "@/src/infrastructure/repositories/SupabaseProfileRepository";
import { cyclePhotoStorage } from "@/src/infrastructure/storage/SupabaseCyclePhotoStorage";
import type { GrowerProfile } from "@/src/ports/ProfileRepository";

export function useProfile() {
  const [data, setData] = useState<GrowerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [avatarError, setAvatarError] = useState<Error | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const profile = await profileRepository.getMine();
      setData(profile);
      setAvatarUrl(profile?.avatarPath ? await cyclePhotoStorage.createSignedUrl(profile.avatarPath, 3600) : null);
    }
    catch (reason) { setError(reason instanceof Error ? reason : new Error("Profile could not be loaded.")); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  const chooseAvatar = useCallback(async () => {
    if (!data) return;
    setAvatarSaving(true); setAvatarError(null);
    let uploadedPath: string | null = null;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) throw new Error("Photo access is needed to choose a profile picture.");
      const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], mediaTypes: ["images"], quality: 0.8 });
      const asset = result.assets?.[0];
      if (!asset) return;
      const response = await fetch(asset.uri);
      if (!response.ok) throw new Error("The selected photo could not be read.");
      const body = await response.arrayBuffer();
      uploadedPath = await cyclePhotoStorage.uploadProfile(data.id, asset.fileName ?? "profile.jpg", body, asset.mimeType ?? "image/jpeg");
      const signedUrl = await cyclePhotoStorage.createSignedUrl(uploadedPath, 3600);
      const previousPath = data.avatarPath;
      const updated = await profileRepository.updateAvatarPath(uploadedPath);
      setData(updated);
      setAvatarUrl(signedUrl);
      if (previousPath) await cyclePhotoStorage.remove(previousPath).catch(() => undefined);
    } catch (reason) {
      if (uploadedPath) await cyclePhotoStorage.remove(uploadedPath).catch(() => undefined);
      setAvatarError(reason instanceof Error ? reason : new Error("Your profile photo could not be saved."));
    } finally { setAvatarSaving(false); }
  }, [data]);
  return { data, loading, error, reload, avatarUrl, avatarSaving, avatarError, chooseAvatar };
}
