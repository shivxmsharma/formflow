import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
                <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Page not found</h1>
                <p className="text-sm text-gray-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <Link to="/dashboard" className="btn-primary w-auto px-6 inline-block">
                    Back to dashboard
                </Link>
            </div>
        </div>
    );
}