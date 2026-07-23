import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleCopyError = () => {
    const errorDetails = `Error: ${this.state.error?.message}\n\nStack:\n${this.state.error?.stack}\n\nComponent Stack:\n${this.state.errorInfo?.componentStack}`;
    navigator.clipboard.writeText(errorDetails);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 sm:p-6">
          {/* Background Ambient Glow */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-2xl w-full bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl shadow-red-950/20 text-center">
            {/* Header Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Error Title & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto mb-8">
              An unexpected error occurred while rendering this page. Don't worry, your data is completely safe!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>

            {/* Toggle Error Details */}
            <div className="border-t border-slate-800/80 pt-6 text-left">
              <button
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                className="inline-flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors py-1 cursor-pointer"
              >
                <span>Technical Details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-3 relative">
                  <div className="absolute right-3 top-3 z-10">
                    <button
                      onClick={this.handleCopyError}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      title="Copy Error Logs"
                    >
                      {this.state.copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 text-xs">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-xs">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-red-300 leading-relaxed space-y-3">
                    <div>
                      <span className="text-red-400 font-bold">Error Message:</span>{' '}
                      {this.state.error?.message || 'Unknown Error'}
                    </div>

                    {this.state.error?.stack && (
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Stack Trace:</span>
                        <pre className="whitespace-pre-wrap break-all text-slate-400 text-[11px]">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}

                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <span className="text-slate-400 font-bold block mb-1">Component Stack:</span>
                        <pre className="whitespace-pre-wrap break-all text-slate-400 text-[11px]">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
