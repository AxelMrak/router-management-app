import { useAuthStore } from "@/store/auth.store";
import { Sidebar } from "./Sidebar";
import { LoginForm } from "@/features/auth/LoginForm";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        {/* Page header */}
        <header className="h-16 border-b border-border flex items-center px-8 shrink-0">
          <div>
            <h1 className="text-base font-semibold text-foreground leading-none">{title}</h1>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
