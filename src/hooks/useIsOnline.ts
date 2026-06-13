import { useNetInfo } from "@react-native-community/netinfo";
import type { NetInfoState } from "@react-native-community/netinfo";

export function isOnline(state: NetInfoState): boolean {
  return state.isConnected === true && state.isInternetReachable !== false;
}

export function useIsOnline(): boolean {
  const netInfo = useNetInfo();
  return isOnline(netInfo);
}
