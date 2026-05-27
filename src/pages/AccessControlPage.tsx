import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AccessControlList } from "@/features/access-control/AccessControlList";

export default function AccessControlPage() {
  return (
    <DashboardLayout
      title="Control de Acceso"
      description="Reglas de filtrado URL, IP, puerto y MAC"
    >
      <AccessControlList />
    </DashboardLayout>
  );
}
