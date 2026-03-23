import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicForm, submitFormResponse } from "../api/public.api";

export default function PublicForm() {
    const { token } = useParams();
    const [form, setForm] = useState(null);
    const [fields, setFields] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        const load = async () => {
            try {
                const { data } = await fetchPublicForm(token);
                setForm(data.form);
                setFields(data.form.fields || []);
            } catch (err) {
                setError(
                    err.response?.status === 404
                        ? "This form doesn't exist or is no longer accepting responses."
                        : "Failed to load form. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [token]);

    const handleChange = (fieldId, value) => {
        setAnswers((prev) => ({ ...prev, [fieldId]: value }));
        // Clear error on change
        if (fieldErrors[fieldId]) {
            setFieldErrors((prev) => ({ ...prev, [fieldId]: null }));
        }
    };

    const handleCheckbox = (fieldId, option, checked) => {
        setAnswers((prev) => {
            const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
            return {
                ...prev,
                [fieldId]: checked
                    ? [...current, option]
                    : current.filter((v) => v !== option),
            };
        });
        if (fieldErrors[fieldId]) {
            setFieldErrors((prev) => ({ ...prev, [fieldId]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side required validation
        const errs = {};
        for (const field of fields) {
            if (!field.required) continue;
            const val = answers[field.id];
            const empty =
                val === undefined || val === null || val === "" ||
                (Array.isArray(val) && val.length === 0);
            if (empty) errs[field.id] = "This field is required";
        }
        if (Object.keys(errs).length) {
            setFieldErrors(errs);
            // Scroll to first error
            const firstId = Object.keys(errs)[0];
            document.getElementById(`field-${firstId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
        }

        setSubmitting(true);
        try {
            await submitFormResponse(token, { answers });
            setSubmitted(true);
        } catch (err) {
            const msg = err.response?.data?.message || "Submission failed. Please try again.";
            const fieldId = err.response?.data?.fieldId;
            if (fieldId) {
                setFieldErrors({ [fieldId]: msg });
            } else {
                setError(msg);
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error && !submitting) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 mb-2">Form unavailable</h1>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    // ── Success ────────────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h1>
                    <p className="text-gray-500 text-sm">
                        Your response has been recorded successfully.
                    </p>
                    {form?.description && (
                        <p className="text-gray-400 text-xs mt-3">{form.description}</p>
                    )}
                </div>
            </div>
        );
    }

    // ── Form ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-xl mx-auto">
                {/* Header card */}
                <div className="bg-primary-600 rounded-t-2xl px-6 py-6">
                    <h1 className="text-xl font-bold text-white">{form.title}</h1>
                    {form.description && (
                        <p className="text-primary-100 text-sm mt-2">{form.description}</p>
                    )}
                </div>

                {/* Form card */}
                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="bg-white rounded-b-2xl border border-t-0 border-gray-200 shadow-sm px-6 py-6"
                >
                    <div className="flex flex-col gap-6">
                        {fields.map((field) => (
                            <div key={field.id} id={`field-${field.id}`}>
                                <FormField
                                    field={field}
                                    value={answers[field.id]}
                                    error={fieldErrors[field.id]}
                                    onChange={handleChange}
                                    onCheckboxChange={handleCheckbox}
                                />
                            </div>
                        ))}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary mt-2"
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : "Submit"}
                        </button>
                    </div>
                </form>

                <p className="text-center text-xs text-gray-400 mt-5">
                    Powered by FormFlow
                </p>
            </div>
        </div>
    );
}

// Renders a single field with label, input, and error
function FormField({ field, value, error, onChange, onCheckboxChange }) {
    const opts = Array.isArray(field.options) ? field.options : [];

    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {field.field_type === "text" && (
                <input
                    type="text"
                    className={`input ${error ? "border-red-400 focus:ring-red-400" : ""}`}
                    placeholder={field.placeholder || ""}
                    value={value || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            )}

            {field.field_type === "email" && (
                <input
                    type="email"
                    className={`input ${error ? "border-red-400 focus:ring-red-400" : ""}`}
                    placeholder={field.placeholder || "your@email.com"}
                    value={value || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            )}

            {field.field_type === "number" && (
                <input
                    type="number"
                    className={`input ${error ? "border-red-400 focus:ring-red-400" : ""}`}
                    placeholder={field.placeholder || ""}
                    value={value || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            )}

            {field.field_type === "textarea" && (
                <textarea
                    className={`input resize-none ${error ? "border-red-400 focus:ring-red-400" : ""}`}
                    rows={4}
                    placeholder={field.placeholder || ""}
                    value={value || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            )}

            {field.field_type === "date" && (
                <input
                    type="date"
                    className={`input ${error ? "border-red-400 focus:ring-red-400" : ""}`}
                    value={value || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                />
            )}

            {field.field_type === "radio" && (
                <div className="flex flex-col gap-2.5 mt-1">
                    {opts.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="radio"
                                name={field.id}
                                value={opt}
                                checked={value === opt}
                                onChange={() => onChange(field.id, opt)}
                                className="text-primary-600 w-4 h-4 flex-shrink-0"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {field.field_type === "checkbox" && (
                <div className="flex flex-col gap-2.5 mt-1">
                    {opts.map((opt) => (
                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={Array.isArray(value) && value.includes(opt)}
                                onChange={(e) => onCheckboxChange(field.id, opt, e.target.checked)}
                                className="text-primary-600 w-4 h-4 rounded flex-shrink-0"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{opt}</span>
                        </label>
                    ))}
                </div>
            )}

            {field.field_type === "dropdown" && (
                <select
                    className={`input ${error ? "border-red-400 focus:ring-red-400" : ""}`}
                    value={value || ""}
                    onChange={(e) => onChange(field.id, e.target.value)}
                >
                    <option value="">Select an option</option>
                    {opts.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            )}

            {error && <p className="field-error">{error}</p>}
        </div>
    );
}