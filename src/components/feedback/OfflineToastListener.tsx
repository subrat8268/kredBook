import { useEffect, useRef } from "react";
import { useToast } from "@/src/components/feedback/Toast";
import { onOfflineQueued, onMutationDropped } from "@/src/lib/offlineEvents";

const COOLDOWN_MS = 2000;

export default function OfflineToastListener() {
  const { show } = useToast();
  const lastShownAt = useRef(0);

  useEffect(() => {
    return onOfflineQueued(() => {
      const now = Date.now();
      if (now - lastShownAt.current < COOLDOWN_MS) return;
      lastShownAt.current = now;
      show({
        message: "Saved locally. Will sync when online.",
        type: "success",
      });
    });
  }, [show]);

  useEffect(() => {
    return onMutationDropped(() => {
      show({
        message: "Some changes couldn't be saved. Please check your data.",
        type: "error",
        duration: 5000,
      });
    });
  }, [show]);

  return null;
}
