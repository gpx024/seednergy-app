const invalidSecureStoreKeyCharacters = /[^A-Za-z0-9._-]/g;

export function toSecureStoreKey(key: string, suffix = ""): string {
  return `${key.replace(invalidSecureStoreKeyCharacters, ".")}${suffix}`;
}
