import { useEffect } from "react";
import {
  getAccessRules,
  createAccessRule,
  updateAccessRule,
  deleteAccessRule,
} from "@/services/access-control.service";
import { useAccessControlStore } from "@/store/access-control.store";
import { useAuthStore } from "@/store/auth.store";
import type { AccessRule } from "@/types/router";
import { toast } from "sonner";

export function useAccessControl() {
  const { rules, isLoading, error, setRules, setLoading, setError, addRule, updateRule, removeRule } =
    useAccessControlStore();
  const token = useAuthStore((state) => state.token);

  async function refresh() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAccessRules(token);
      if (result.success) {
        setRules(result.data);
      } else {
        setError(result.error.message);
      }
    } catch {
      setError("Failed to load rules");
    } finally {
      setLoading(false);
    }
  }

  async function create(rule: Omit<AccessRule, "id">) {
    if (!token) return;
    try {
      const result = await createAccessRule(token, rule);
      if (result.success) {
        const newRule: AccessRule = { ...rule, id: crypto.randomUUID() };
        addRule(newRule);
        toast.success("Rule created");
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to create rule");
    }
  }

  async function update(rule: AccessRule) {
    if (!token) return;
    try {
      const result = await updateAccessRule(token, rule);
      if (result.success) {
        updateRule(rule);
        toast.success("Rule updated");
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to update rule");
    }
  }

  async function remove(id: string) {
    if (!token) return;
    try {
      const result = await deleteAccessRule(token, id);
      if (result.success) {
        removeRule(id);
        toast.success("Rule deleted");
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to delete rule");
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { rules, isLoading, error, refresh, create, update, remove };
}
