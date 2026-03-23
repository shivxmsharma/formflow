const FIELD_TYPES = [
    { type: "text", label: "Short text", icon: "T", desc: "Single line answer" },
    { type: "textarea", label: "Long text", icon: "¶", desc: "Paragraph answer" },
    { type: "email", label: "Email", icon: "@", desc: "Email address" },
    { type: "number", label: "Number", icon: "#", desc: "Numeric value" },
    { type: "radio", label: "Multiple choice", icon: "◉", desc: "Pick one option" },
    { type: "checkbox", label: "Checkboxes", icon: "☑", desc: "Pick many options" },
    { type: "dropdown", label: "Dropdown", icon: "▾", desc: "Select from list" },
    { type: "date", label: "Date", icon: "□", desc: "Date picker" },
];

export default function FieldPalette({ onAdd, disabled }) {
    return (
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col overflow-y-auto flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Add field</p>
            </div>
            <div className="p-3 flex flex-col gap-1.5">
                {FIELD_TYPES.map(({ type, label, icon, desc }) => (
                    <button
                        key={type}
                        onClick={() => !disabled && onAdd(type)}
                        disabled={disabled}
                        className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg
                       hover:bg-primary-50 hover:text-primary-700 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed group"
                    >
                        <span className="w-7 h-7 rounded-md bg-gray-100 group-hover:bg-primary-100
                             flex items-center justify-center text-sm font-mono text-gray-500
                             group-hover:text-primary-600 transition-colors flex-shrink-0">
                            {icon}
                        </span>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700 leading-tight">{label}</p>
                            <p className="text-xs text-gray-400 truncate">{desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </aside>
    );
}