import { jsonRpcCall, createRouterClient } from "./router.service";
import type { AccessRule, ApiResult } from "@/types/router";

const client = createRouterClient();

export async function getAccessRules(
  token: string
): Promise<ApiResult<AccessRule[]>> {
  return jsonRpcCall<AccessRule[]>(
    client,
    token,
    "access_control",
    "get_rules",
    {}
  );
}

export async function createAccessRule(
  token: string,
  rule: Omit<AccessRule, "id">
): Promise<ApiResult<AccessRule>> {
  return jsonRpcCall<AccessRule>(
    client,
    token,
    "access_control",
    "add_rule",
    { ...rule }
  );
}

export async function updateAccessRule(
  token: string,
  rule: AccessRule
): Promise<ApiResult<AccessRule>> {
  return jsonRpcCall<AccessRule>(
    client,
    token,
    "access_control",
    "update_rule",
    { ...rule }
  );
}

export async function deleteAccessRule(
  token: string,
  id: string
): Promise<ApiResult<Record<string, never>>> {
  return jsonRpcCall<Record<string, never>>(
    client,
    token,
    "access_control",
    "delete_rule",
    { id }
  );
}
