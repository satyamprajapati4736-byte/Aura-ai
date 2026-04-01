
import React, { useState, useEffect } from 'react';
import { AppScreen, AssistantConfig, Message } from '../types';

interface SidebarProps {
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  config: AssistantConfig;
  messages: Message[];
  onClearChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  connectionStatus?: 'stable' | 'weak' | 'failed';
  repairing?: boolean;
  canInstall?: boolean;
  onInstall?: () => void;
  onExport?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, setScreen, config, messages, onClearChat, isOpen, onClose, connectionStatus = 'stable', repairing = false, canInstall = false, onInstall, onExport }) => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Aura',
          text: 'She is more than AI.',
          url: window.location.href,
        });
      } catch (err) { console.warn('Share failed'); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied Boss!');
    }
  };

  const statusMap = {
    stable: { color: 'bg-emerald-500', label: 'System Online' },
    weak: { color: 'bg-yellow-500 animate-pulse', label: 'Signal Weak' },
    failed: { color: 'bg-red-500', label: 'System Failure' }
  };

  const currentStatus = statusMap[connectionStatus];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed md:relative z-50 w-72 h-full glass border-r transition-all duration-500 transform flex flex-col
        ${config.shadowMode ? 'border-slate-800' : 'border-emerald-800/30'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-500/50 rotate-3`}>
              <img src={config.avatarUrl} alt="Aura" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter italic uppercase">{config.aiName}</h1>
              <div className="flex items-center space-x-1">
                 <div className={`w-1.5 h-1.5 rounded-full ${repairing ? 'bg-blue-500 animate-ping' : currentStatus.color}`}></div>
                 <p className="text-[8px] text-emerald-400 uppercase tracking-widest font-black">
                   {repairing ? 'Healing...' : currentStatus.label}
                 </p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <button onClick={() => { setScreen(AppScreen.CHAT); onClose(); }} className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all ${currentScreen === AppScreen.CHAT ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:bg-white/5'}`}>
              <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              <span className="font-black text-xs uppercase tracking-widest text-left">Command Center</span>
            </button>
            <button onClick={() => { setScreen(AppScreen.SETTINGS); onClose(); }} className={`w-full flex items-center px-5 py-4 rounded-2xl transition-all ${currentScreen === AppScreen.SETTINGS ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/30' : 'text-slate-500 hover:bg-white/5'}`}>
              <svg className="w-5 h-5 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
              <span className="font-black text-xs uppercase tracking-widest text-left">Protocols</span>
            </button>
          </div>

          <div className="pt-8 space-y-4">
            <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">System Core</p>
            
            <div className="grid grid-cols-1 gap-2">
              {canInstall && !isStandalone && (
                <button onClick={onInstall} className="w-full flex items-center px-5 py-3 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/30 hover:scale-105 transition-all">
                  <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Install App
                </button>
              )}
              
              <button onClick={handleShare} className="w-full flex items-center px-5 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all">
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 101.332-2.684 3 3 0 00-1.332 2.684z" /></svg>
                Share Access
              </button>

              <button onClick={onExport} className="w-full flex items-center px-5 py-3 rounded-2xl bg-slate-900/40 border border-slate-800/50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-emerald-400 transition-all">
                <svg className="w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
                Backup Logs
              </button>
            </div>

            <p className="px-4 pt-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] text-center">Loyalty Level</p>
            <div className={`px-2 bg-slate-900/40 p-5 rounded-3xl border border-white/5`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase text-emerald-400">Compliance</span>
                <span className="text-[10px] font-black text-emerald-400">100%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full bg-emerald-500 ${repairing ? 'animate-pulse' : ''}`} style={{ width: `100%` }}></div>
              </div>
            </div>
            
            <button onClick={onClearChat} className="w-full py-3 text-[10px] text-red-900/40 hover:text-red-500 font-black uppercase tracking-[0.5em] transition-all">
              Factory Reset
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800/50 bg-slate-950/40">
          <div className="flex items-center p-3 bg-slate-900/80 rounded-2xl border border-white/5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-black text-white shadow-xl text-lg rotate-3`}>
              {config.ownerName.charAt(0)}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-black text-white uppercase truncate tracking-tighter">{config.ownerName}</p>
              <p className={`text-[9px] text-emerald-500/70 font-bold uppercase tracking-[0.2em]`}>System Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
