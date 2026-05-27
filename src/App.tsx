import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DevicesPage from "@/pages/DevicesPage";
import AccessControlPage from "@/pages/AccessControlPage";
import GuestWifiPage from "@/pages/GuestWifiPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/devices"
          element={
            <ProtectedRoute>
              <DevicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/access-control"
          element={
            <ProtectedRoute>
              <AccessControlPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/guest-wifi"
          element={
            <ProtectedRoute>
              <GuestWifiPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
