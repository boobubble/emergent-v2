import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { logger } from "@/lib/logger";
import { resetFeatureState, type FeatureStoreKey } from "@/lib/persisted-state-recovery";

export interface AppErrorBoundaryProps {
  children: ReactNode;
  /** Route section label for logs and recovery */
  section?: string;
  featureStore?: FeatureStoreKey;
  onRecover?: () => void;
  /** Compact inline fallback vs full-page */
  variant?: "page" | "inline";
}

interface State {
  error: Error | null;
  retryCount: number;
}

function ErrorFallback({
  error,
  section,
  featureStore,
  onRecover,
  variant,
  onRetry,
  onResetState,
}: {
  error: Error | null;
  section?: string;
  featureStore?: FeatureStoreKey;
  onRecover?: () => void;
  variant: "page" | "inline";
  onRetry: () => void;
  onResetState: () => void;
}) {
  const isDev = import.meta.env.DEV;
  const wrapper =
    variant === "page"
      ? "flex min-h-[50vh] items-center justify-center px-4 py-12"
      : "rounded-xl border border-destructive/30 bg-destructive/5 p-6";

  return (
    <div className={wrapper} role="alert">
      <div className="max-w-md text-center">
        <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {section ? `The ${section} section hit a problem.` : "This part of the app hit a problem."}{" "}
          You can retry or go back home — the rest of the site should still work.
        </p>
        {isDev && error && (
          <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-muted p-2 text-left text-[10px] text-muted-foreground">
            {error.message}
          </pre>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Retry
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Go home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Reload page
          </button>
          {featureStore && (
            <button
              type="button"
              onClick={onResetState}
              className="inline-flex items-center justify-center rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Reset saved data
            </button>
          )}
        </div>
        <button
          type="button"
          className="mt-3 text-xs text-muted-foreground underline hover:text-foreground"
          onClick={() => {
            logger.info("User reported problem", { section, message: error?.message });
          }}
        >
          Report problem
        </button>
      </div>
    </div>
  );
}

/**
 * Production-grade React error boundary with logging, retry, and scoped state recovery.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, State> {
  state: State = { error: null, retryCount: 0 };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.capture({
      severity: "fatal",
      message: error.message || "React render error",
      stack: error.stack ?? null,
      component_stack: info.componentStack,
      metadata: {
        source: "react-error-boundary",
        section: this.props.section,
        retryCount: this.state.retryCount,
      },
    });
    try {
      this.props.onRecover?.();
    } catch {
      /* ignore recovery failures */
    }
  }

  handleRetry = () => {
    this.setState((s) => ({ error: null, retryCount: s.retryCount + 1 }));
  };

  handleResetState = () => {
    if (this.props.featureStore) resetFeatureState(this.props.featureStore);
    this.props.onRecover?.();
    this.handleRetry();
  };

  render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          section={this.props.section}
          featureStore={this.props.featureStore}
          onRecover={this.props.onRecover}
          variant={this.props.variant ?? "page"}
          onRetry={this.handleRetry}
          onResetState={this.handleResetState}
        />
      );
    }
    return this.props.children;
  }
}

/** Convenience wrapper for major route sections */
export function RouteErrorBoundary({
  section,
  featureStore,
  onRecover,
  children,
}: {
  section: string;
  featureStore?: FeatureStoreKey;
  onRecover?: () => void;
  children: ReactNode;
}) {
  return (
    <AppErrorBoundary section={section} featureStore={featureStore} onRecover={onRecover} variant="inline">
      {children}
    </AppErrorBoundary>
  );
}
