import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Navbar from "../components/shared/Navbar";
import useFormStore from "../store/formStore";
import Skeleton from "../components/shared/Skeleton";

export default function Dashboard() {
    const navigate = useNavigate();
    const { forms, formsLoading, loadForms, createNewForm, removeForm } = useFormStore();
    const [creating, setCreating] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    useEffect(() => { loadForms(); }, [loadForms]);

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            const form = await createNewForm(newTitle.trim());
            toast.success("Form created!");
            setShowNewModal(false);
            setNewTitle("");
            navigate(`/builder/${form.id}`);
        } catch { toast.error("Failed to create form"); }
        finally { setCreating(false); }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("Delete this form? This cannot be undone.")) return;
        setDeletingId(id);
        try { await removeForm(id); toast.success("Form deleted"); }
        catch { toast.error("Failed to delete form"); }
        finally { setDeletingId(null); }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Forms</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{forms.length} form{forms.length !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                        onClick={() => { setShowNewModal(true); setNewTitle(""); }}
                        className="btn-primary w-auto px-5 py-2.5 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New form
                    </button>
                </div>

                {formsLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => <Skeleton.FormCard key={i} />)}
                    </div>
                )}

                {!formsLoading && forms.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">No forms yet</h2>
                        <p className="text-gray-500 text-sm mt-1 mb-6">Create your first form to get started</p>
                        <button onClick={() => setShowNewModal(true)} className="btn-primary w-auto px-6">Create a form</button>
                    </div>
                )}

                {!formsLoading && forms.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                onClick={() => navigate(`/builder/${form.id}`)}
                                className="bg-white rounded-xl border border-gray-200 p-5 cursor-pointer
                           hover:border-primary-300 hover:shadow-sm transition-all group relative"
                            >
                                {form.role === "collaborator" && (
                                    <span className="absolute top-3 right-3 text-xs bg-indigo-50 text-indigo-600
                                   border border-indigo-100 px-2 py-0.5 rounded-full font-medium">
                                        Collaborator
                                    </span>
                                )}
                                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center mb-3">
                                    <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-semibold text-gray-900 text-sm truncate pr-16">{form.title}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    {form.fieldCount || 0} field{(form.fieldCount || 0) !== 1 ? "s" : ""} ·{" "}
                                    {form.is_published
                                        ? <span className="text-green-600 font-medium">Published</span>
                                        : "Draft"}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">{new Date(form.created_at).toLocaleDateString()}</p>

                                {/* Responses link */}
                                {form.is_published && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/responses/${form.id}`); }}
                                        className="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        View responses
                                    </button>
                                )}

                                {form.role === "owner" && (
                                    <button
                                        onClick={(e) => handleDelete(e, form.id)}
                                        disabled={deletingId === form.id}
                                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100
                               text-gray-300 hover:text-red-500 transition-all p-1 rounded"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {showNewModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowNewModal(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Name your form</h2>
                        <input autoFocus type="text" className="input"
                            placeholder="e.g. Customer Feedback Survey"
                            value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()} maxLength={200} />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setShowNewModal(false)} className="btn-ghost flex-1">Cancel</button>
                            <button onClick={handleCreate} disabled={creating || !newTitle.trim()} className="btn-primary flex-1">
                                {creating ? "Creating..." : "Create form"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}