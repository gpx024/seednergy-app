import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { connectivityService } from "@/src/infrastructure/network/NetInfoConnectivityService";
import type { ConnectivityStatus } from "@/src/ports/ConnectivityService";

interface ConnectivityContextValue { status: ConnectivityStatus; isOffline: boolean; }
const ConnectivityContext = createContext<ConnectivityContextValue>({ status: "unknown", isOffline: false });

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<ConnectivityStatus>("unknown");
  useEffect(() => {
    let mounted = true;
    void connectivityService.getStatus().then((next) => { if (mounted) setStatus(next); });
    const unsubscribe = connectivityService.subscribe(setStatus);
    return () => { mounted = false; unsubscribe(); };
  }, []);
  const value = useMemo(() => ({ status, isOffline: status === "offline" }), [status]);
  return <ConnectivityContext.Provider value={value}>{children}</ConnectivityContext.Provider>;
}

export function useConnectivity() { return useContext(ConnectivityContext); }
