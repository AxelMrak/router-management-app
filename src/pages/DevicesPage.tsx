import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DevicesTable } from "@/features/devices/DevicesTable";

export default function DevicesPage() {
  return (
    <DashboardLayout
      title="Dispositivos"
      description="Gestiona dispositivos conectados y horarios"
    >
      <DevicesTable />
    </DashboardLayout>
  );
}
