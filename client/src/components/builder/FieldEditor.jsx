import { useEffect, useState } from "react";

export default function FieldEditor({ field, onUpdate, onClose }) {
    const [label, setLabel] = useState(field.label);
    const [placeholder, setPlaceholder] = useState(field.placeholder || "");
    const [required, setRequired] = useState(field.required);
    const [options, setOptions] = useState(
        Array.isArray(field.options) ? field.options.join("\n") : ""
    );

    useEffect(() => {
        setLabel(field.label);
        setPlaceholder(field.placeholder || "");
        setRequired(field.required);
        setOptions(Array.isArray(field.options) ? field.options.join("\n") : "");
    }, [field.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const updates = { label, placeholder, required };
            if (hasOptions) updates.options = options.split("\n").map((o) => o.trim()).filter(Boolean);
            onUpdate(field.id, updates);
        }, 600);
        return () => clearTimeout(timer);
    }, [label, placeholder, required, options]);

    const hasOptions = ["radio", "checkbox", "dropdown"].includes(field.field_type);
    const hasPlaceholder = ["text", "textarea", "email", "number"].includes(field.field_type);

    return (
        <aside className="w-64 bg-white border-l border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Edit field</p>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="p-4 flex flex-col gap-5">
                <div>
                    <p className="label">Field type</p>
                    <span className="inline-block text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-medium capitalize">
                        {field.field_type}
                    </span>
                </div>

                <div>
                    <label className="label">Question label</label>
                    <input type="text" className="input" value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Enter your question" maxLength={300} />
                </div>

                {hasPlaceholder && (
                    <div>
                        <label className="label">Placeholder <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input type="text" className="input" value={placeholder}
                            onChange={(e) => setPlaceholder(e.target.value)}
                            placeholder="Hint text shown inside field" maxLength={200} />
                    </div>
                )}

                {hasOptions && (
                    <div>
                        <label className="label">Options</label>
                        <p className="text-xs text-gray-400 mb-1.5">One option per line</p>
                        <textarea className="input resize-none font-mono text-xs" rows={5}
                            value={options} onChange={(e) => setOptions(e.target.value)}
                            placeholder={"Option A\nOption B\nOption C"} />
                        <p className="text-xs text-gray-400 mt-1">
                            {options.split("\n").filter((o) => o.trim()).length} options
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Required</p>
                        <p className="text-xs text-gray-400">Respondent must answer</p>
                    </div>
                    <button
                        onClick={() => setRequired((r) => !r)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
              ${required ? "bg-primary-600" : "bg-gray-200"}`}
                    >
                        <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
                            style={{ transform: required ? "translateX(18px)" : "translateX(2px)" }} />
                    </button>
                </div>

                <div className="h-px bg-gray-100" />
                <p className="text-xs text-gray-400 text-center">Changes save automatically</p>
            </div>
        </aside>
    );
}