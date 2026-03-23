import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function FieldCard({ field, isSelected, onSelect, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : "auto",
    };

    const typeLabels = {
        text: "Short text", textarea: "Long text", email: "Email",
        number: "Number", radio: "Multiple choice", checkbox: "Checkboxes",
        dropdown: "Dropdown", date: "Date",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(field.id)}
            className={`
        group flex items-center gap-3 px-4 py-3.5 rounded-xl border cursor-pointer
        transition-all bg-white
        ${isSelected
                    ? "border-primary-400 ring-2 ring-primary-100 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                }
        ${isDragging ? "shadow-lg" : ""}
      `}
        >
            <div
                {...attributes} {...listeners}
                className="flex flex-col gap-0.5 cursor-grab active:cursor-grabbing
                   opacity-30 hover:opacity-70 transition-opacity flex-shrink-0 py-1 px-0.5"
                onClick={(e) => e.stopPropagation()}
            >
                {[0, 1, 2].map((r) => (
                    <div key={r} className="flex gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-gray-500" />
                        <div className="w-1 h-1 rounded-full bg-gray-500" />
                    </div>
                ))}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{field.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                    <span>{typeLabels[field.field_type] || field.field_type}</span>
                    {field.required && <span className="text-red-400 font-semibold">· Required</span>}
                </p>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onDelete(field.id); }}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500
                   transition-all p-1 rounded flex-shrink-0"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}