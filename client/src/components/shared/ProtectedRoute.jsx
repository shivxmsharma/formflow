import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

// Wraps any route that needs authentication.
// Saves the intended URL so we can redirect back after login.
export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    // While initAuth is running, show nothing (avoids flash of redirect)
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}