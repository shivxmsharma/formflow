import { useEffect, useState } from "react";
import Skeleton from "../components/shared/Skeleton";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function ResponsesPage() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("summary"); // "summary" | "individual"
    const [activeResponseIdx, setActiveResponseIdx] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: res } = await api.get(`/forms/${id}/responses`);
                setData(res);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
                        <Skeleton className="w-5 h-5 rounded" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-xl border border-gray-200 px-5 py-4">
                                <Skeleton className="h-3 w-24 mb-2" />
                                <Skeleton className="h-7 w-16" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3].map(i => <Skeleton.ResponseCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Failed to load responses.</p>
            </div>
        );
    }

    const { form, fields, responses, analytics, total } = data;
    const activeResponse = responses[activeResponseIdx];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
                    <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-semibold text-gray-900 truncate">{form.title}</h1>
                        <p className="text-xs text-gray-400">Responses</p>
                    </div>
                    <Link
                        to={`/builder/${id}`}
                        className="btn-ghost py-1.5 px-3 text-sm"
                    >
                        Edit form
                    </Link>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    <StatCard label="Total responses" value={total} />
                    <StatCard label="Fields" value={fields.length} />
                    <StatCard
                        label="Last response"
                        value={
                            responses.length > 0
                                ? new Date(responses[0].submitted_at).toLocaleDateString()
                                : "—"
                        }
                    />
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                    {["summary", "individual"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors capitalize
                ${activeTab === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {tab === "summary" ? "Summary" : "Individual"}
                        </button>
                    ))}
                </div>

                {/* ── Summary tab ─────────────────────────────────────────────────── */}
                {activeTab === "summary" && (
                    <div>
                        {total === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="flex flex-col gap-6">
                                {fields.map((field) => (
                                    <FieldSummary
                                        key={field.id}
                                        field={field}
                                        responses={responses}
                                        analytics={analytics[field.id]}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Individual tab ──────────────────────────────────────────────── */}
                {activeTab === "individual" && (
                    <div>
                        {total === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                                {/* Response list */}
                                <div className="sm:col-span-1 flex flex-col gap-2">
                                    {responses.map((r, idx) => (
                                        <button
                                            key={r.id}
                                            onClick={() => setActiveResponseIdx(idx)}
                                            className={`text-left px-3 py-2.5 rounded-lg border text-sm transition-colors
                        ${idx === activeResponseIdx
                                                    ? "bg-primary-50 border-primary-200 text-primary-700 font-medium"
                                                    : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                                                }`}
                                        >
                                            <p className="font-medium">Response {idx + 1}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(r.submitted_at).toLocaleDateString()}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                {/* Response detail */}
                                {activeResponse && (
                                    <div className="sm:col-span-3 bg-white rounded-xl border border-gray-200 p-5">
                                        <div className="flex items-center justify-between mb-5">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    Response {activeResponseIdx + 1}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Submitted {new Date(activeResponse.submitted_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {activeResponse.respondent_email && (
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                                    {activeResponse.respondent_email}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {fields.map((field) => {
                                                const answer = activeResponse.answers?.find(
                                                    (a) => a.field_id === field.id
                                                );
                                                let displayValue = answer?.value || "—";
                                                // Try to parse checkbox arrays
                                                try {
                                                    const parsed = JSON.parse(displayValue);
                                                    if (Array.isArray(parsed)) {
                                                        displayValue = parsed.join(", ");
                                                    }
                                                } catch { }

                                                return (
                                                    <div key={field.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                        <p className="text-xs font-medium text-gray-500 mb-1">{field.label}</p>
                                                        <p className={`text-sm ${answer ? "text-gray-900" : "text-gray-400 italic"}`}>
                                                            {displayValue}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
    );
}

function FieldSummary({ field, responses, analytics }) {
    const totalAnswered = responses.filter((r) =>
        r.answers?.some((a) => a.field_id === field.id && a.value)
    ).length;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-semibold text-gray-900">{field.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{field.field_type}</p>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {totalAnswered} / {responses.length} answered
                </span>
            </div>

            {/* Choice fields — show bar chart */}
            {analytics && Object.keys(analytics.counts).length > 0 ? (
                <div className="flex flex-col gap-2.5">
                    {Object.entries(analytics.counts)
                        .sort(([, a], [, b]) => b - a)
                        .map(([option, count]) => {
                            const pct = responses.length > 0
                                ? Math.round((count / responses.length) * 100)
                                : 0;
                            return (
                                <div key={option}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-700 truncate max-w-xs">{option}</span>
                                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                            {count} ({pct}%)
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                </div>
            ) : (
                /* Text fields — show last few answers */
                <div className="flex flex-col gap-2">
                    {responses
                        .flatMap((r) => r.answers?.filter((a) => a.field_id === field.id && a.value) || [])
                        .slice(0, 5)
                        .map((answer, i) => (
                            <div key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 truncate">
                                {answer.value}
                            </div>
                        ))}
                    {totalAnswered > 5 && (
                        <p className="text-xs text-gray-400 text-center">
                            +{totalAnswered - 5} more responses
                        </p>
                    )}
                    {totalAnswered === 0 && (
                        <p className="text-sm text-gray-400 italic">No answers yet</p>
                    )}
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">No responses yet</h2>
            <p className="text-gray-500 text-sm mt-1">
                Share your form link to start collecting responses
            </p>
        </div>
    );
}