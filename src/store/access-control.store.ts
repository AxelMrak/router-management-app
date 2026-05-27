import { create } from "zustand";
import type { AccessRule } from "@/types/router";

interface AccessControlState {
  rules: AccessRule[];
  isLoading: boolean;
  error: string | null;
  setRules: (rules: AccessRule[]) => void;
  setLoading: (v: boolean) => void;
  setError: (msg: string | null) => void;
  addRule: (rule: AccessRule) => void;
  updateRule: (rule: AccessRule) => void;
  removeRule: (id: string) => void;
}

export const useAccessControlStore = create<AccessControlState>((set) => ({
  rules: [],
  isLoading: false,
  error: null,
  setRules: (rules) => set({ rules }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addRule: (rule) =>
    set((state) => ({ rules: [...state.rules, rule] })),
  updateRule: (rule) =>
    set((state) => ({
      rules: state.rules.map((r) => (r.id === rule.id ? rule : r)),
    })),
  removeRule: (id) =>
    set((state) => ({ rules: state.rules.filter((r) => r.id !== id) })),
}));
