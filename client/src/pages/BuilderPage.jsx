import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
    SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

import useFormStore from "../store/formStore";
import useSocketStore from "../store/socketStore";
import useFormSocket from "../socket/useFormSocket";
import FieldPalette from "../components/builder/FieldPalette";
import FieldCard from "../components/builder/FieldCard";
import FieldEditor from "../components/builder/FieldEditor";
import PresenceBar from "../components/builder/PresenceBar";
import SharePanel from "../components/builder/SharePanel";

export default function BuilderPage() {
    const { id } = useParams();
    const {
        activeForm, activeFields, selectedFieldId, builderLoading, isSaving,
        loadForm, updateActiveForm, addNewField, updateActiveField,
        removeField, reorderActiveFields, selectField, clearSelectedField, clearBuilder,
    } = useFormStore();

    const {
        emitFieldAdded, emitFieldUpdated, emitFieldDeleted,
        emitFieldsReordered, emitFormUpdated,
    } = useSocketStore();

    // Wire up Socket.io — joins room, listens for remote changes, cleans up on unmount
    useFormSocket(id);

    const [showPreview, setShowPreview] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");

    useEffect(() => {
        loadForm(id);
        return () => clearBuilder();
    }, [id]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = useCallback(async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = activeFields.findIndex((f) => f.id === active.id);
        const newIndex = activeFields.findIndex((f) => f.id === over.id);
        const reordered = arrayMove(activeFields, oldIndex, newIndex);
        await reorderActiveFields(id, reordered);
        // Broadcast new order to collaborators
        emitFieldsReordered(id, reordered);
    }, [activeFields, id, reorderActiveFields, emitFieldsReordered]);

    const handleAddField = async (fieldType) => {
        try {
            const field = await addNewField(id, fieldType);
            // Broadcast new field to collaborators
            emitFieldAdded(id, field);
        } catch {
            toast.error("Failed to add field");
        }
    };

    const handleUpdateField = async (fieldId, updates) => {
        try {
            await updateActiveField(id, fieldId, updates);
            // Broadcast field update to collaborators
            emitFieldUpdated(id, fieldId, updates);
        } catch {
            toast.error("Failed to save field");
        }
    };

    const handleDeleteField = async (fieldId) => {
        try {
            await removeField(id, fieldId);
            // Broadcast deletion to collaborators
            emitFieldDeleted(id, fieldId);
            toast.success("Field removed");
        } catch {
            toast.error("Failed to delete field");
        }
    };

    const startEditingTitle = () => {
        setTitleDraft(activeForm.title);
        setEditingTitle(true);
    };

    const saveTitle = async () => {
        setEditingTitle(false);
        if (titleDraft.trim() && titleDraft !== activeForm.title) {
            await updateActiveForm(id, { title: titleDraft.trim() });
            emitFormUpdated(id, { title: titleDraft.trim() });
        }
    };

    const handlePublishToggle = async () => {
        try {
            const newState = !activeForm.is_published;
            await updateActiveForm(id, { is_published: newState });
            emitFormUpdated(id, { is_published: newState });
            toast.success(newState ? "Form published!" : "Form unpublished");
        } catch {
            toast.error("Failed to update publish status");
        }
    };

    const handleTogglePreview = () => {
        setShowPreview((v) => {
            if (!v) clearSelectedField();
            return !v;
        });
    };

    const selectedField = activeFields.find((f) => f.id === selectedFieldId) || null;

    if (builderLoading) {
        return (
            <div className="h-screen flex flex-col bg-gray-50">
                <div className="h-14 bg-white border-b border-gray-200 animate-pulse" />
                <div className="flex-1 flex">
                    <div className="w-56 bg-white border-r border-gray-200 animate-pulse" />
                    <div className="flex-1" />
                </div>
            </div>
        );
    }

    if (!activeForm) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500">Form not found or access denied.</p>
                    <Link to="/dashboard" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
                        Back to dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-50">

            {/* Top bar */}
            <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 z-30">
                <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>

                {editingTitle ? (
                    <input
                        autoFocus type="text" value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        onBlur={saveTitle}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle();
                            if (e.key === "Escape") setEditingTitle(false);
                        }}
                        className="text-sm font-semibold text-gray-900 bg-gray-100 rounded px-2 py-1
                       outline-none focus:ring-2 focus:ring-primary-400 max-w-xs"
                        maxLength={200}
                    />
                ) : (
                    <button
                        onClick={startEditingTitle}
                        className="text-sm font-semibold text-gray-900 hover:bg-gray-100
                       rounded px-2 py-1 transition-colors max-w-xs truncate"
                    >
                        {activeForm.title}
                    </button>
                )}

                {isSaving && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Saving...
                    </span>
                )}

                <div className="flex-1" />

                {/* Presence bar — live collaborator avatars */}
                <PresenceBar />

                <span className="text-xs text-gray-400 hidden sm:block">
                    {activeFields.length} field{activeFields.length !== 1 ? "s" : ""}
                </span>

                <button
                    onClick={handleTogglePreview}
                    className={`py-1.5 px-3 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors
            ${showPreview
                            ? "bg-primary-50 text-primary-700 border border-primary-200"
                            : "btn-ghost"
                        }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {showPreview ? "Hide preview" : "Preview"}
                </button>

                {/* Share panel — copy link + responses button when published */}
                {activeForm.is_published && activeForm.share_token && (
                    <SharePanel formId={id} shareToken={activeForm.share_token} />
                )}

                <button
                    onClick={handlePublishToggle}
                    className={`w-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors
            ${activeForm.is_published
                            ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                            : "btn-primary"
                        }`}
                >
                    {activeForm.is_published ? "Published ✓" : "Publish"}
                </button>
            </header>

            {/* Main area */}
            <div className="flex-1 flex overflow-hidden">

                <FieldPalette onAdd={handleAddField} />

                {/* Canvas — always visible */}
                <main className="flex-1 overflow-y-auto p-6 min-w-0">
                    <div className="max-w-xl mx-auto">
                        <div className="mb-4">
                            <textarea
                                className="input resize-none text-sm"
                                rows={2}
                                placeholder="Form description (optional)"
                                defaultValue={activeForm.description || ""}
                                onBlur={(e) => {
                                    if (e.target.value !== (activeForm.description || "")) {
                                        updateActiveForm(id, { description: e.target.value });
                                        emitFormUpdated(id, { description: e.target.value });
                                    }
                                }}
                            />
                        </div>

                        {activeFields.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-xl py-16 text-center">
                                <p className="text-sm font-medium text-gray-400">No fields yet</p>
                                <p className="text-xs text-gray-300 mt-1">Click a field type on the left to add it</p>
                            </div>
                        )}

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                        >
                            <SortableContext
                                items={activeFields.map((f) => f.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="flex flex-col gap-2">
                                    {activeFields.map((field) => (
                                        <FieldCard
                                            key={field.id}
                                            field={field}
                                            isSelected={field.id === selectedFieldId}
                                            onSelect={selectField}
                                            onDelete={handleDeleteField}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>
                </main>

                {/* Right panel — preview OR field editor */}
                {showPreview && (
                    <div className="w-96 flex-shrink-0 border-l border-gray-200 flex flex-col overflow-hidden">
                        <div className="h-10 bg-white border-b border-gray-100 flex items-center justify-between px-4 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live preview</span>
                            </div>
                            <button
                                onClick={handleTogglePreview}
                                className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <PreviewPanel form={activeForm} fields={activeFields} />
                        </div>
                    </div>
                )}

                {!showPreview && selectedField && (
                    <FieldEditor
                        key={selectedField.id}
                        field={selectedField}
                        onUpdate={handleUpdateField}
                        onClose={clearSelectedField}
                    />
                )}
            </div>
        </div>
    );
}

function PreviewPanel({ form, fields }) {
    if (fields.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-sm font-medium text-gray-400">No fields yet</p>
                <p className="text-xs text-gray-400 mt-1">Add fields to see the preview update live</p>
            </div>
        );
    }

    return (
        <div className="p-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-primary-600 px-4 py-3">
                    <h2 className="text-sm font-semibold text-white truncate">{form?.title || "Untitled Form"}</h2>
                    {form?.description && (
                        <p className="text-primary-100 text-xs mt-0.5 truncate">{form.description}</p>
                    )}
                </div>
                <div className="px-4 py-4 flex flex-col gap-4">
                    {fields.map((field) => <PreviewField key={field.id} field={field} />)}
                    <button className="w-full py-2 bg-primary-600 text-white text-xs font-medium
                             rounded-lg opacity-75 cursor-default mt-1" tabIndex={-1}>
                        Submit
                    </button>
                </div>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">Updates live as you edit</p>
        </div>
    );
}

function PreviewField({ field }) {
    const opts = Array.isArray(field.options) ? field.options : [];
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.field_type === "text" && <input type="text" className="input text-xs py-1.5" placeholder={field.placeholder || ""} disabled />}
            {field.field_type === "email" && <input type="email" className="input text-xs py-1.5" placeholder={field.placeholder || "your@email.com"} disabled />}
            {field.field_type === "number" && <input type="number" className="input text-xs py-1.5" placeholder={field.placeholder || "0"} disabled />}
            {field.field_type === "textarea" && <textarea className="input resize-none text-xs py-1.5" rows={2} placeholder={field.placeholder || ""} disabled />}
            {field.field_type === "date" && <input type="date" className="input text-xs py-1.5" disabled />}
            {(field.field_type === "radio" || field.field_type === "checkbox") && (
                <div className="flex flex-col gap-1.5">
                    {opts.length === 0 && <p className="text-xs text-gray-400 italic">No options yet</p>}
                    {opts.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2">
                            <input type={field.field_type} disabled className="flex-shrink-0" />
                            <span className="text-xs text-gray-600">{opt}</span>
                        </label>
                    ))}
                </div>
            )}
            {field.field_type === "dropdown" && (
                <select className="input text-xs py-1.5" disabled>
                    <option>Select an option</option>
                    {opts.map((opt, i) => <option key={i}>{opt}</option>)}
                </select>
            )}
        </div>
    );
}