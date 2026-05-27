import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AccessControlList } from "@/features/access-control/AccessControlList";

export default function AccessControlPage() {
  return (
    <DashboardLayout
      title="Access Control"
      description="URL, IP, port, and MAC filtering rules"
    >
      <AccessControlList />
    </DashboardLayout>
  );
}
