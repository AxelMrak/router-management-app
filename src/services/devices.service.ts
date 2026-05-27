import { jsonRpcCall, createRouterClient } from "./router.service";
import type { Device, ApiResult } from "@/types/router";

const client = createRouterClient();

/**
 * Raw device shape returned by the router firmware.
 * Field names vary per OEM — adjust to match your hardware.
 */
interface RawDevice {
  mac?: string;
  ip?: string;
  hostname?: string;
  online?: boolean | number;
  band?: string;
  blocked?: boolean | number;
  schedule?: string;
}

function normalizeDevice(raw: RawDevice): Device {
  return {
    mac: (raw.mac ?? "").toUpperCase(),
    ip: raw.ip ?? "",
    hostname: raw.hostname || "Unknown",
    status: raw.online ? "online" : "offline",
    band: (raw.band as Device["band"]) ?? undefined,
    blocked: Boolean(raw.blocked),
    scheduleId: raw.schedule ?? undefined,
  };
}

export async function getDevices(token: string): Promise<ApiResult<Device[]>> {
  const result = await jsonRpcCall<{ devices?: RawDevice[] }>(
    client,
    token,
    "devices_app",
    "FwBase_get",
    { action: "dump" }
  );

  if (!result.success) return result;

  const devices = (result.data.devices ?? []).map(normalizeDevice);
  return { success: true, data: devices };
}

export async function blockDevice(
  token: string,
  mac: string,
  blocked: boolean
): Promise<ApiResult<Record<string, never>>> {
  return jsonRpcCall(client, token, "devices_app", "FwBase_set", {
    action: blocked ? "block" : "unblock",
    mac,
  });
}

export async function setDeviceSchedule(
  token: string,
  mac: string,
  scheduleId: string | null
): Promise<ApiResult<Record<string, never>>> {
  return jsonRpcCall(client, token, "devices_app", "FwBase_set", {
    action: "set_schedule",
    mac,
    schedule: scheduleId ?? "",
  });
}
