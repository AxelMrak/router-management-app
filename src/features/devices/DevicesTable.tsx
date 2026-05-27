import { useState } from "react";
import { useDevices } from "@/hooks/use-devices";
import type { Device, Weekday } from "@/types/router";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DaySelector } from "@/components/ui/day-selector";
import {
  RefreshCw,
  Ban,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  Wifi,
  Monitor,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setDeviceSchedule } from "@/services/devices.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

function BandIcon({ band }: { band?: Device["band"] }) {
  if (!band) return <Monitor className="w-3.5 h-3.5 text-muted-foreground" />;
  if (band === "wired") return <Network className="w-3.5 h-3.5 text-muted-foreground" />;
  return <Wifi className="w-3.5 h-3.5 text-primary" />;
}

interface ScheduleModalProps {
  device: Device;
  onClose: () => void;
}

function ScheduleModal({ device, onClose }: ScheduleModalProps) {
  const [days, setDays] = useState<Weekday[]>([]);
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("22:00");
  const [saving, setSaving] = useState(false);
  const token = useAuthStore((state) => state.token);

  async function handleSave() {
    if (!token) return;
    setSaving(true);
    try {
      const result = await setDeviceSchedule(token, device.mac, crypto.randomUUID());
      if (result.success) {
        toast.success(`Schedule applied to ${device.hostname}`);
        onClose();
      } else {
        toast.error(result.error.message);
      }
    } catch {
      toast.error("Failed to apply schedule");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-foreground">Schedule Access</DialogTitle>
          <p className="text-sm text-muted-foreground">{device.hostname}</p>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Days */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Active Days
            </p>
            <DaySelector value={days} onChange={setDays} />
          </div>

          {/* Time range */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Time Range
            </p>
            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted-foreground">From</label>
                <Input
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="bg-input border-border font-mono text-sm"
                />
              </div>
              <div className="mt-5 text-muted-foreground text-sm">—</div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-xs text-muted-foreground">To</label>
                <Input
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="bg-input border-border font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || days.length === 0}>
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Apply Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DevicesTable() {
  const { devices, isLoading, error, refresh, toggleBlock } = useDevices();
  const [search, setSearch] = useState("");
  const [schedulingDevice, setSchedulingDevice] = useState<Device | null>(null);

  const filtered = devices.filter(
    (d) =>
      d.hostname.toLowerCase().includes(search.toLowerCase()) ||
      d.ip.includes(search) ||
      d.mac.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Scanning network…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-3">
        <p className="text-sm text-destructive">{error}</p>
        <Button variant="outline" size="sm" onClick={refresh} className="border-border gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search hostname, IP, MAC…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-input border-border text-sm h-9"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          className="border-border gap-2 h-9"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Device
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  IP Address
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  MAC Address
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Band
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                    {search ? "No devices match your search" : "No devices found"}
                  </td>
                </tr>
              ) : (
                filtered.map((device) => (
                  <tr
                    key={device.mac}
                    className="border-b border-border/50 last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-8 h-8 rounded-lg border flex items-center justify-center",
                          device.status === "online"
                            ? "bg-[oklch(0.63_0.18_150)]/10 border-[oklch(0.63_0.18_150)]/20"
                            : "bg-muted/40 border-border"
                        )}>
                          <Monitor className={cn(
                            "w-3.5 h-3.5",
                            device.status === "online" ? "text-[oklch(0.63_0.18_150)]" : "text-muted-foreground"
                          )} />
                        </div>
                        <span className="font-medium text-foreground">{device.hostname}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {device.ip}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                      {device.mac}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <BandIcon band={device.band} />
                        {device.band ?? "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {device.blocked ? (
                        <StatusBadge variant="blocked" />
                      ) : (
                        <StatusBadge variant={device.status} />
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-7 px-2.5 text-xs gap-1.5",
                            device.blocked
                              ? "text-[oklch(0.63_0.18_150)] hover:bg-[oklch(0.63_0.18_150)]/10"
                              : "text-destructive hover:bg-destructive/10"
                          )}
                          onClick={() => toggleBlock(device.mac, !device.blocked)}
                        >
                          {device.blocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                          {device.blocked ? "Unblock" : "Block"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground hover:bg-accent"
                          onClick={() => setSchedulingDevice(device)}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Schedule
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-2.5 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {filtered.length} device{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </p>
          </div>
        )}
      </div>

      {schedulingDevice && (
        <ScheduleModal
          device={schedulingDevice}
          onClose={() => setSchedulingDevice(null)}
        />
      )}
    </>
  );
}
