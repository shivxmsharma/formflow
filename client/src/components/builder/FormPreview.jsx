export default function FormPreview({ form, fields }) {
    if (!fields.length) {
        return (
            <div className="flex-1 bg-gray-50 flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Preview</p>
                    <p className="text-xs text-gray-400 mt-1">Add fields to see a preview</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-gray-50 overflow-y-auto">
            <div className="max-w-xl mx-auto py-8 px-4">
                <div className="flex justify-center mb-5">
                    <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full font-medium">
                        Preview mode
                    </span>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="bg-primary-600 px-6 py-5">
                        <h1 className="text-lg font-semibold text-white">{form?.title || "Untitled Form"}</h1>
                        {form?.description && <p className="text-primary-100 text-sm mt-1">{form.description}</p>}
                    </div>
                    <div className="px-6 py-5 flex flex-col gap-5">
                        {fields.map((field) => <PreviewField key={field.id} field={field} />)}
                        <button className="w-full mt-2 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg opacity-80 cursor-default" tabIndex={-1}>
                            Submit
                        </button>
                    </div>
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">This is a preview — submissions are disabled</p>
            </div>
        </div>
    );
}

function PreviewField({ field }) {
    const opts = Array.isArray(field.options) ? field.options : [];
    return (
        <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
                {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.field_type === "text" && <input type="text" className="input" placeholder={field.placeholder || ""} disabled />}
            {field.field_type === "email" && <input type="email" className="input" placeholder={field.placeholder || "your@email.com"} disabled />}
            {field.field_type === "number" && <input type="number" className="input" placeholder={field.placeholder || "0"} disabled />}
            {field.field_type === "textarea" && <textarea className="input resize-none" rows={3} placeholder={field.placeholder || ""} disabled />}
            {field.field_type === "date" && <input type="date" className="input" disabled />}
            {(field.field_type === "radio" || field.field_type === "checkbox") && (
                <div className="flex flex-col gap-2">
                    {opts.length === 0 && <p className="text-xs text-gray-400 italic">No options defined yet</p>}
                    {opts.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2.5">
                            <input type={field.field_type} disabled />
                            <span className="text-sm text-gray-700">{opt}</span>
                        </label>
                    ))}
                </div>
            )}
            {field.field_type === "dropdown" && (
                <select className="input" disabled>
                    <option>Select an option</option>
                    {opts.map((opt, i) => <option key={i}>{opt}</option>)}
                </select>
            )}
        </div>
    );
}