import { useEffect } from "react";
import { getDevices, blockDevice } from "@/services/devices.service";
import { useDevicesStore } from "@/store/devices.store";
import { useAuthStore } from "@/store/auth.store";
import type { Device } from "@/types/router";
import { toast } from "sonner";

export function useDevices() {
  const { devices, isLoading, error, setDevices, setLoading, setError, updateDevice } =
    useDevicesStore();
  const token = useAuthStore((state) => state.token);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getDevices(token);
      if (result.success) {
        setDevices(result.data);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("Failed to load devices");
    } finally {
      setLoading(false);
    }
  }

  async function toggleBlock(mac: string, blocked: boolean) {
    if (!token) return;
    try {
      const result = await blockDevice(token, mac, blocked);
      if (result.success) {
        updateDevice(mac, { blocked });
        toast.success(blocked ? "Device blocked" : "Device unblocked");
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to update device");
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { devices, isLoading, error, refresh, toggleBlock };
}
