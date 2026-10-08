import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error in App:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F6] flex items-center justify-center p-4 text-center">
          <div className="bg-white p-8 rounded-3xl border border-[#F2E5E8] shadow-xl max-w-md w-full space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="font-serif-luxury text-2xl font-bold text-[#2D2024]">
              Une erreur est survenue
            </h2>
            <p className="text-xs text-[#70585F] leading-relaxed">
              {this.state.error?.message || "Un problème est survenu lors de l'affichage."}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="bg-[#BE395D] hover:bg-[#9E2B4B] text-white text-xs font-bold uppercase py-3.5 px-6 rounded-full inline-flex items-center gap-2 transition-all shadow-md"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retourner à l'accueil</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
