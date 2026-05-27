import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wifi,
  Monitor,
  ShieldCheck,
  LogOut,
  Router,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const routerUrl = import.meta.env.VITE_ROUTER_URL || "192.168.0.1";
const routerIp = routerUrl.replace(/^https?:\/\//, "");

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/dashboard/guest-wifi", icon: Wifi, label: "WiFi Invitados" },
  { href: "/dashboard/devices", icon: Monitor, label: "Dispositivos" },
  { href: "/dashboard/access-control", icon: ShieldCheck, label: "Control de Acceso" },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const { logout } = useAuthStore();

  return (
    <aside className="flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Router className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-sidebar-foreground leading-none">RouterAdmin</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{routerIp}</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-3 mb-2">
          Administración
        </p>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-sidebar-primary" : "")} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3 h-3 text-sidebar-primary/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          <span>Desconectar</span>
        </button>
      </div>
    </aside>
  );
}
