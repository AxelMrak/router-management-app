import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GuestWifiForm } from "@/features/guest-wifi/GuestWifiForm";

export default function GuestWifiPage() {
  return (
    <DashboardLayout
      title="Guest Wi-Fi"
      description="Configure the isolated guest network"
    >
      <GuestWifiForm />
    </DashboardLayout>
  );
}
