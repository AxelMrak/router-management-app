// ─── JSON-RPC ────────────────────────────────────────────────────────────────

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: number;
  method: "call";
  params: [string, string, string, Record<string, unknown>];
}

export interface JsonRpcResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number;
  result: [number, T] | null;
  error?: { code: number; message: string };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

// ─── Devices ─────────────────────────────────────────────────────────────────

export type DeviceStatus = "online" | "offline";
export type DeviceBand = "2.4GHz" | "5GHz" | "wired";

export interface Device {
  mac: string;
  ip: string;
  hostname: string;
  status: DeviceStatus;
  band?: DeviceBand;
  blocked: boolean;
  scheduleId?: string;
}

// ─── Guest WiFi ───────────────────────────────────────────────────────────────

export type EncryptionMode = "none" | "wpa2" | "wpa3" | "wpa2/wpa3";

export interface GuestWifiConfig {
  enabled: boolean;
  ssid_24: string;
  ssid_5: string;
  password: string;
  encryption: EncryptionMode;
}

// ─── Access Control ───────────────────────────────────────────────────────────

export type RuleType = "url" | "ip" | "port" | "mac";
export type Protocol = "tcp" | "udp" | "both";

export interface TimeRange {
  start: string; // "HH:MM"
  end: string;   // "HH:MM"
}

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface AccessRule {
  id: string;
  name: string;
  enabled: boolean;
  type: RuleType;
  value: string;          // URL, IP, port number, or MAC
  protocol?: Protocol;
  days: Weekday[];
  timeRange?: TimeRange;
  targetMacs?: string[];  // empty = apply to all devices
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export interface DeviceSchedule {
  id: string;
  deviceMac: string;
  days: Weekday[];
  timeRange: TimeRange;
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: number;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
