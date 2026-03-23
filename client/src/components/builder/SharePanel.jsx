import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// Shown in the builder header when the form is published
export default function SharePanel({ formId, shareToken }) {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    const shareUrl = `${window.location.origin}/f/${shareToken}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Failed to copy link");
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* Shareable URL */}
            <div className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-200
                      rounded-lg px-2.5 py-1.5 max-w-xs">
                <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="text-xs text-gray-500 truncate max-w-[140px]">{shareUrl}</span>
            </div>

            {/* Copy button */}
            <button
                onClick={handleCopy}
                className={`py-1.5 px-3 text-sm font-medium rounded-lg flex items-center gap-1.5 transition-colors
          ${copied
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                    }`}
            >
                {copied ? (
                    <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                    </>
                ) : (
                    <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy link
                    </>
                )}
            </button>

            {/* View responses */}
            <button
                onClick={() => navigate(`/responses/${formId}`)}
                className="py-1.5 px-3 text-sm font-medium rounded-lg flex items-center gap-1.5
                   bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Responses
            </button>
        </div>
    );
}