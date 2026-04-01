import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("System Critical Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#000504] flex flex-col items-center justify-center font-mono text-emerald-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="z-10 text-center space-y-6 max-w-md px-6">
             <div className="w-16 h-16 border-l-2 border-t-2 border-red-500 rounded-tl-full animate-spin mx-auto mb-6"></div>
             <h1 className="text-2xl font-black uppercase tracking-tighter text-red-500">Neural Link Severed</h1>
             <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-widest">
               Critical error detected in cognitive sub-routine. System integrity compromised.
             </p>
             <button 
               onClick={() => {
                 localStorage.removeItem('aura_history'); 
                 window.location.reload();
               }}
               className="px-8 py-4 bg-red-500/10 border border-red-500/50 rounded-xl hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-[0.3em] text-red-400 w-full"
             >
               Force System Reboot
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;