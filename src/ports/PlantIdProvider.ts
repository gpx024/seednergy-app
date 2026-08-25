export interface PlantIdInput { storagePath: string; }
export interface IdResult { plantName: string | null; confidence: "high" | "medium" | "low" | "unknown"; }
export interface PlantIdProvider { identify(input: PlantIdInput): Promise<IdResult>; }
