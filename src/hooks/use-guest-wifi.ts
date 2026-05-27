import { useState, useEffect } from "react";
import { getGuestWifiConfig, setGuestWifiConfig } from "@/services/guest-wifi.service";
import { useAuthStore } from "@/store/auth.store";
import type { GuestWifiConfig } from "@/types/router";
import { toast } from "sonner";

export function useGuestWifi() {
  const [config, setConfig] = useState<GuestWifiConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const token = useAuthStore((state) => state.token);

  async function load() {
    if (!token) return;
    setIsLoading(true);
    try {
      const result = await getGuestWifiConfig(token);
      if (result.success) {
        setConfig(result.data);
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to load Guest WiFi config");
    } finally {
      setIsLoading(false);
    }
  }

  async function save(values: GuestWifiConfig) {
    if (!token) return;
    setIsSaving(true);
    try {
      const result = await setGuestWifiConfig(token, values);
      if (result.success) {
        setConfig(values);
        toast.success("Guest WiFi saved");
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to save Guest WiFi config");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { config, isLoading, isSaving, save };
}
