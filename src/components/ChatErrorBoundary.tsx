import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Called when the boundary catches an error — typically clears persisted chat state. */
  onRecover?: () => void;
  /** Optional fallback while recovered / after error. */
  fallback?: ReactNode;
  label?: string;
}

interface State {
  error: Error | null;
}

/**
 * Prevents a corrupted chat subtree from crashing the entire authenticated app.
 */
export class ChatErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ChatErrorBoundary${this.props.label ? `: ${this.props.label}` : ""}]`, error, info);
    try {
      this.props.onRecover?.();
    } catch (recoverErr) {
      console.error("[ChatErrorBoundary] recovery failed", recoverErr);
    }
  }

  handleRetry = () => {
    try {
      this.props.onRecover?.();
    } catch (recoverErr) {
      console.error("[ChatErrorBoundary] recovery failed", recoverErr);
    }
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Chat unavailable</p>
          <p className="mt-1">Something went wrong loading messages. The rest of the app should still work.</p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-3 inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
