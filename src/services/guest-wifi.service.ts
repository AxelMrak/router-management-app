import { jsonRpcCall, createRouterClient } from "./router.service";
import type { GuestWifiConfig, ApiResult } from "@/types/router";

const client = createRouterClient();

export async function getGuestWifiConfig(
  token: string
): Promise<ApiResult<GuestWifiConfig>> {
  return jsonRpcCall<GuestWifiConfig>(
    client,
    token,
    "guest_wifi",
    "get_config",
    {}
  );
}

export async function setGuestWifiConfig(
  token: string,
  config: GuestWifiConfig
): Promise<ApiResult<Record<string, never>>> {
  return jsonRpcCall<Record<string, never>>(
    client,
    token,
    "guest_wifi",
    "set_config",
    { ...config }
  );
}
