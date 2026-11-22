import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('HAVEN Application ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBF9] flex items-center justify-center p-6 text-stone-900">
          <div className="max-w-md w-full bg-white rounded-lg border border-stone-200 shadow-md p-8 text-center space-y-5">
            <div className="w-12 h-12 rounded-md bg-stone-100 text-[#14532D] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
                An Unexpected Disruption Occurred
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                The application encountered an issue while rendering this section. Your saved preferences and data remain intact.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#14532D] text-white text-xs font-bold shadow-xs hover:bg-[#166534] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-stone-200 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
