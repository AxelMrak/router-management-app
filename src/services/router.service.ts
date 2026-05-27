import axios, { AxiosInstance, AxiosError } from "axios";
import type { JsonRpcRequest, JsonRpcResponse, ApiResult } from "@/types/router";

const ROUTER_URL = import.meta.env.VITE_ROUTER_URL ?? "http://192.168.0.1";

let _rpcId = 1;

function nextId(): number {
  return _rpcId++;
}

/**
 * Create a configured Axios instance for the router.
 */
export function createRouterClient(): AxiosInstance {
  return axios.create({
    baseURL: ROUTER_URL,
    timeout: 8000,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Fire a raw JSON-RPC call to /ubus and return the inner result object.
 * This replaces the old ubusCall function.
 */
export async function jsonRpcCall<T = Record<string, unknown>>(
  client: AxiosInstance,
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
    const { data } = await client.post<JsonRpcResponse<T>>("/ubus", body);

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
export async function routerLogin(
  client: AxiosInstance,
  username: string,
  password: string
): Promise<ApiResult<{ ubus_rpc_session: string }>> {
  return jsonRpcCall<{ ubus_rpc_session: string }>(
    client,
    "00000000000000000000000000000000", // null session for login
    "session",
    "login",
    { username, password, timeout: 300 }
  );
}
