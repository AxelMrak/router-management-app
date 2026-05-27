import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDevicesStore } from "@/store/devices.store";
import { useAccessControlStore } from "@/store/access-control.store";
import { Monitor, Shield, Wifi, AlertTriangle } from "lucide-react";

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-2xl font-semibold text-foreground mt-0.5 tabular-nums">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const devices = useDevicesStore((s) => s.devices);
  const rules = useAccessControlStore((s) => s.rules);

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const blockedCount = devices.filter((d) => d.blocked).length;

  return (
    <DashboardLayout
      title="Panel"
      description="Resumen de la red en tiempo real"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Monitor className="w-5 h-5 text-primary" />}
          label="Total Dispositivos"
          value={devices.length}
          sub={`${onlineCount} en línea`}
        />
        <StatCard
          icon={<Wifi className="w-5 h-5 text-primary" />}
          label="En línea"
          value={onlineCount}
          sub={devices.length > 0 ? `${Math.round((onlineCount / devices.length) * 100)}% del total` : "—"}
        />
        <StatCard
          icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
          label="Bloqueados"
          value={blockedCount}
          sub={blockedCount === 1 ? "1 dispositivo restringido" : `${blockedCount} dispositivos restringidos`}
        />
        <StatCard
          icon={<Shield className="w-5 h-5 text-primary" />}
          label="Reglas de Acceso"
          value={rules.length}
          sub={`${rules.filter((r) => r.enabled).length} activas`}
        />
      </div>
    </DashboardLayout>
  );
}
