import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";
import ErrorBoundary from "./components/shared/ErrorBoundary";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import BuilderPage from "./pages/BuilderPage";
import PublicForm from "./pages/PublicForm";
import ResponsesPage from "./pages/ResponsesPage";
import NotFound from "./pages/NotFound";

export default function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: { fontSize: "14px", borderRadius: "10px" },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/f/:token" element={<PublicForm />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/builder/:id" element={<ProtectedRoute><BuilderPage /></ProtectedRoute>} />
          <Route path="/responses/:id" element={<ProtectedRoute><ResponsesPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}