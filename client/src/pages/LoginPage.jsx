import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuthStore();
    const from = location.state?.from?.pathname || "/dashboard";

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.email.trim()) errs.email = "Email is required";
        if (!form.password) errs.password = "Password is required";
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await login(form.email, form.password);
            toast.success("Welcome back!");
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed. Please try again.");
            setErrors({ email: " ", password: " " });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mb-4">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your FormFlow account</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div>
                            <label className="label" htmlFor="email">Email address</label>
                            <input id="email" name="email" type="email" autoComplete="email" autoFocus
                                value={form.email} onChange={handleChange} placeholder="jane@example.com"
                                className={`input ${errors.email?.trim() ? "border-red-400 focus:ring-red-400" : ""}`} />
                            {errors.email?.trim() && <p className="field-error">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" autoComplete="current-password"
                                value={form.password} onChange={handleChange} placeholder="Your password"
                                className={`input ${errors.password?.trim() ? "border-red-400 focus:ring-red-400" : ""}`} />
                            {errors.password?.trim() && <p className="field-error">{errors.password}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary mt-2">
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-primary-600 font-medium hover:underline">
                        Create one free
                    </Link>
                </p>
            </div>
        </div>
    );
}