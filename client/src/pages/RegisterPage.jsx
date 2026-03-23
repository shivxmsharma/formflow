import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuthStore();
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
        if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
        if (!form.password || form.password.length < 8) errs.password = "Password must be at least 8 characters";
        return errs;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password);
            toast.success("Account created! Welcome to FormFlow.");
            navigate("/dashboard");
        } catch (err) {
            if (err.response?.data?.errors) {
                const serverErrors = {};
                err.response.data.errors.forEach((e) => { serverErrors[e.path] = e.msg; });
                setErrors(serverErrors);
            } else {
                toast.error(err.response?.data?.message || "Registration failed.");
            }
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
                    <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                    <p className="text-sm text-gray-500 mt-1">Start building forms in minutes</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} noValidate className="space-y-5">
                        <div>
                            <label className="label" htmlFor="name">Full name</label>
                            <input id="name" name="name" type="text" autoComplete="name" autoFocus
                                value={form.name} onChange={handleChange} placeholder="Jane Doe"
                                className={`input ${errors.name ? "border-red-400" : ""}`} />
                            {errors.name && <p className="field-error">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="email">Email address</label>
                            <input id="email" name="email" type="email" autoComplete="email"
                                value={form.email} onChange={handleChange} placeholder="jane@example.com"
                                className={`input ${errors.email ? "border-red-400" : ""}`} />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>
                        <div>
                            <label className="label" htmlFor="password">Password</label>
                            <input id="password" name="password" type="password" autoComplete="new-password"
                                value={form.password} onChange={handleChange} placeholder="At least 8 characters"
                                className={`input ${errors.password ? "border-red-400" : ""}`} />
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary mt-2">
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}