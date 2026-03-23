import { Component } from "react";

// Class component — the only way to catch render errors in React
// Wrap the entire app in this so a crash in one component doesn't blank the whole screen
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error("ErrorBoundary caught:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="text-center max-w-sm">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h1 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            An unexpected error occurred. Try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary w-auto px-6"
                        >
                            Refresh page
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <pre className="mt-6 text-left text-xs bg-red-50 text-red-700 p-3 rounded-lg overflow-auto max-h-40">
                                {this.state.error.toString()}
                            </pre>
                        )}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}