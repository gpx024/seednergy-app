export interface StorageEntry { id: string | null; name: string }
export type ListStoragePage = (prefix: string, offset: number) => Promise<readonly StorageEntry[]>;

export async function collectStoragePaths(rootPrefix: string, listPage: ListStoragePage): Promise<string[]> {
  const files: string[] = [];
  let offset = 0;
  while (true) {
    const entries = await listPage(rootPrefix, offset);
    for (const entry of entries) {
      const path = `${rootPrefix}/${entry.name}`;
      if (entry.id) files.push(path);
      else files.push(...await collectStoragePaths(path, listPage));
    }
    if (entries.length < 100) break;
    offset += entries.length;
  }
  return files;
}
