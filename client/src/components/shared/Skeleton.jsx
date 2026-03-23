// Reusable skeleton blocks for loading states
// Usage: <Skeleton className="h-4 w-3/4" /> or <Skeleton.Card />

export default function Skeleton({ className = "" }) {
    return (
        <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
    );
}

// Pre-built skeleton layouts for common patterns
Skeleton.FormCard = function FormCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse mb-3" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2 mb-1" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
        </div>
    );
};

Skeleton.ResponseCard = function ResponseCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
                <div className="h-4 bg-gray-100 rounded animate-pulse w-1/5" />
            </div>
            <div className="space-y-2">
                <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-full" />
                <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-4/5" />
                <div className="h-2.5 bg-gray-100 rounded-full animate-pulse w-3/5" />
            </div>
        </div>
    );
};

Skeleton.Row = function RowSkeleton({ lines = 3 }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-3 bg-gray-200 rounded animate-pulse"
                    style={{ width: `${100 - i * 12}%` }}
                />
            ))}
        </div>
    );
};