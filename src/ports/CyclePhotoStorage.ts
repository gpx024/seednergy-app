export interface CyclePhotoStorage {
  upload(userId: string, cycleId: string, fileName: string, body: ArrayBuffer, contentType: string): Promise<string>;
  uploadHarvest(userId: string, cycleId: string, fileName: string, body: ArrayBuffer, contentType: string): Promise<string>;
  createSignedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  remove(path: string): Promise<void>;
}
