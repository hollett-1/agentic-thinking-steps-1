import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in component:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-[20px] bg-red-900/90 text-white font-mono text-xs max-w-xl overflow-auto shadow-2xl border border-red-500/50 z-50">
          <h2 className="text-sm font-bold mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            Component Crash Detected
          </h2>
          <div className="font-semibold mb-2 text-red-200">
            {this.state.error && this.state.error.toString()}
          </div>
          <pre className="text-[11px] leading-relaxed whitespace-pre-wrap opacity-80 max-h-96 overflow-y-auto">
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 rounded bg-white/20 hover:bg-white/30 text-white font-sans text-xs font-medium transition-colors"
          >
            Dismiss & Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
