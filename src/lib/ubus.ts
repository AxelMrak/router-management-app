/**
 * ubus.ts — low-level JSON-RPC helper for OEM router firmware.
 * All actual HTTP calls to the router happen here.
 */

import axios, { AxiosError } from "axios";
import type { JsonRpcRequest, JsonRpcResponse, ApiResult } from "@/types/router";

const ROUTER_URL = import.meta.env.VITE_ROUTER_URL ?? "http://192.168.1.1";
let _rpcId = 1;

function nextId() {
  return _rpcId++;
}

/**
 * Fire a raw JSON-RPC call to /ubus and return the inner result object.
 */
export async function ubusCall<T = Record<string, unknown>>(
  token: string,
  service: string,
  method: string,
  params: Record<string, unknown> = {}
): Promise<ApiResult<T>> {
  const body: JsonRpcRequest = {
    jsonrpc: "2.0",
    id: nextId(),
    method: "call",
    params: [token, service, method, params],
  };

  try {
    const { data } = await axios.post<JsonRpcResponse<T>>(
      `${ROUTER_URL}/ubus`,
      body,
      {
        timeout: 8000,
        headers: { "Content-Type": "application/json" },
      }
    );

    if (data.error) {
      return { success: false, error: { message: data.error.message, code: data.error.code } };
    }

    if (!data.result || data.result[0] !== 0) {
      const code = data.result?.[0] ?? -1;
      return {
        success: false,
        error: { message: `ubus error code ${code}`, code },
      };
    }

    return { success: true, data: data.result[1] };
  } catch (err) {
    const error = err as AxiosError;
    return {
      success: false,
      error: { message: error.message ?? "Network error" },
    };
  }
}

/**
 * Login — returns a session token from the router.
 * The router uses "session" service + "login" method.
 */
export async function ubusLogin(
  username: string,
  password: string
): Promise<ApiResult<{ ubus_rpc_session: string }>> {
  return ubusCall<{ ubus_rpc_session: string }>(
    "00000000000000000000000000000000", // null session for login
    "session",
    "login",
    { username, password, timeout: 300 }
  );
}
