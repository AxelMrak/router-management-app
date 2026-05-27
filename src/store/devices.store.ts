import { create } from "zustand";
import type { Device } from "@/types/router";

interface DevicesState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  setDevices: (devices: Device[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  updateDevice: (mac: string, patch: Partial<Device>) => void;
}

export const useDevicesStore = create<DevicesState>((set) => ({
  devices: [],
  isLoading: false,
  error: null,
  setDevices: (devices) => set({ devices }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  updateDevice: (mac, patch) =>
    set((state) => ({
      devices: state.devices.map((d) =>
        d.mac === mac ? { ...d, ...patch } : d
      ),
    })),
}));
