import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DevicesTable } from "@/features/devices/DevicesTable";

export default function DevicesPage() {
  return (
    <DashboardLayout
      title="Devices"
      description="Manage connected devices and schedules"
    >
      <DevicesTable />
    </DashboardLayout>
  );
}
