import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { LoginForm } from "@/features/auth/LoginForm";

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm />;
}
