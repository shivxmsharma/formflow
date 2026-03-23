import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

export default function Navbar() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        toast.success("Logged out");
        navigate("/login");
    };

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <nav className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 sticky top-0 z-40">
            <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-gray-900 hover:opacity-80">
                <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <span>FormFlow</span>
            </Link>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                    {initials}
                </div>
                <button onClick={handleLogout} className="btn-ghost text-sm py-1.5 px-3">
                    Sign out
                </button>
            </div>
        </nav>
    );
}