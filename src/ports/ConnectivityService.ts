export type ConnectivityStatus = "online" | "offline" | "unknown";

export interface ConnectivityService {
  getStatus(): Promise<ConnectivityStatus>;
  subscribe(listener: (status: ConnectivityStatus) => void): () => void;
}
