import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught error:", error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-lg w-full bg-card border border-destructive/30 rounded-lg p-6 shadow-lg">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-foreground" data-testid="text-error-title">
                  Terjadi Kesalahan
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Aplikasi mengalami error yang tidak terduga. Coba muat ulang halaman.
                </p>
              </div>
            </div>

            {this.state.error && import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-xs font-mono text-muted-foreground break-all" data-testid="text-error-message">
                  {this.state.error.message || String(this.state.error)}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-muted-foreground hover:text-foreground">
                      Stack trace
                    </summary>
                    <pre className="text-[10px] font-mono text-muted-foreground mt-2 whitespace-pre-wrap break-all">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button onClick={this.handleReload} className="gap-2" data-testid="button-reload-app">
                <RotateCw className="h-4 w-4" />
                Muat Ulang
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
