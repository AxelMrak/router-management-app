import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GuestWifiForm } from "@/features/guest-wifi/GuestWifiForm";

export default function GuestWifiPage() {
  return (
    <DashboardLayout
      title="WiFi Invitados"
      description="Configura la red aislada para invitados"
    >
      <GuestWifiForm />
    </DashboardLayout>
  );
}
