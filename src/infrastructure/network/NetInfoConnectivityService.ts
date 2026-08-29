import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

import type { ConnectivityService, ConnectivityStatus } from "@/src/ports/ConnectivityService";

function mapState(state: NetInfoState): ConnectivityStatus {
  if (state.isConnected === false || state.isInternetReachable === false) return "offline";
  if (state.isConnected === true) return "online";
  return "unknown";
}

export class NetInfoConnectivityService implements ConnectivityService {
  async getStatus(): Promise<ConnectivityStatus> { return mapState(await NetInfo.fetch()); }
  subscribe(listener: (status: ConnectivityStatus) => void): () => void { return NetInfo.addEventListener((state) => listener(mapState(state))); }
}

export const connectivityService = new NetInfoConnectivityService();
