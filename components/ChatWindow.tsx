
import React, { useState, useRef, useEffect } from 'react';
import { Message, AssistantConfig } from '../types';
import AvatarPresence from './AvatarPresence';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isProcessing: boolean;
  isSpeaking: boolean;
  config: AssistantConfig;
  onToggleSidebar: () => void;
  isOnline: boolean;
  privacyShield: boolean;
  activity: string;
  onReplaySpeech: (text: string) => void;
  onGenerateImage?: (prompt: string) => void;
  onGenerateVideo?: (prompt: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  messages, onSendMessage, isProcessing, isSpeaking, config, 
  onToggleSidebar, isOnline, privacyShield, activity, 
  onReplaySpeech, onGenerateImage, onGenerateVideo 
}) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isProcessing]);

  const handleCreative = (type: 'image' | 'video') => {
    if (!input.trim()) return;
    if (type === 'image') onGenerateImage?.(input);
    else onGenerateVideo?.(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black/60 relative overflow-hidden">
      {/* FULL BODY AVATAR - MAIN VISUAL LAYER */}
      <AvatarPresence 
        isSpeaking={isSpeaking} 
        isProcessing={isProcessing} 
        avatarUrl={config.avatarUrl} 
      />

      {/* OVERLAY CONTENT */}
      <header className="relative z-30 px-6 py-4 glass-header border-b border-emerald-500/10 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onToggleSidebar} className="lg:hidden p-2">
            <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase text-white tracking-tighter drop-shadow-lg">{config.aiName}</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-emerald-400 animate-ping' : 'bg-emerald-900'}`} />
              <p className="text-[8px] font-bold uppercase text-emerald-400 tracking-[0.2em]">{activity}</p>
            </div>
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES - ULTRA GLASSMORPHISM */}
      <div ref={scrollRef} className="relative z-20 flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth scroll-hide">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 select-none">
             <div className="w-20 h-[1px] bg-emerald-500/50 mb-4 animate-pulse"></div>
             <p className="text-[9px] font-black uppercase tracking-[0.6em] text-emerald-500">System Ready, Boss</p>
             <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Awaiting Orders</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-xl transition-all duration-500 group relative
              ${msg.role === 'user' 
                ? 'bg-emerald-600/60 text-white rounded-br-none backdrop-blur-sm border border-emerald-400/20' 
                : 'bg-black/40 border border-emerald-500/10 text-slate-100 rounded-bl-none backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
            }`}>
              <p className="text-[13px] leading-relaxed font-medium whitespace-pre-line">{msg.content}</p>
              
              {msg.type === 'image' && msg.mediaUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-emerald-500/20 shadow-2xl">
                  <img src={msg.mediaUrl} className="w-full h-auto" alt="Aura Visualization" />
                </div>
              )}
              
              {msg.type === 'video' && msg.mediaUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-emerald-500/20 shadow-2xl bg-black">
                  <video src={msg.mediaUrl} controls className="w-full h-auto" />
                </div>
              )}

              {msg.status === 'processing' && (
                <div className="mt-2 flex items-center space-x-2 text-emerald-400">
                  <div className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[8px] font-black uppercase tracking-widest animate-pulse">Syncing...</span>
                </div>
              )}
              
              <div className="absolute -bottom-4 right-2 opacity-0 group-hover:opacity-40 transition-opacity">
                <p className="text-[7px] font-bold uppercase text-slate-500">{new Date(msg.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INPUT AREA - SEAMLESS BOTTOM BAR */}
      <div className="relative z-30 p-4 pb-8 glass-footer border-t border-emerald-500/5">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder={`Command me, Boss...`}
              className="w-full bg-black/60 border border-emerald-500/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/40 backdrop-blur-2xl transition-all placeholder:text-emerald-900/40"
              onKeyDown={(e) => e.key === 'Enter' && onSendMessage(input)}
            />
          </div>
          <div className="flex space-x-1.5">
            <button onClick={() => handleCreative('image')} className="p-4 bg-emerald-950/40 rounded-2xl text-lg hover:bg-emerald-900/60 transition-all active:scale-90 border border-emerald-500/10 backdrop-blur-xl">🖼️</button>
            <button onClick={() => handleCreative('video')} className="p-4 bg-emerald-950/40 rounded-2xl text-lg hover:bg-emerald-900/60 transition-all active:scale-90 border border-emerald-500/10 backdrop-blur-xl">🎬</button>
            <button 
              onClick={() => { if(input.trim()) { onSendMessage(input); setInput(''); } }} 
              className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-900/40 active:scale-90 transition-all hover:bg-emerald-500 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .glass-header { background: linear-gradient(to bottom, rgba(0,13,10,0.95), rgba(0,13,10,0.4)); backdrop-filter: blur(10px); }
        .glass-footer { background: linear-gradient(to top, rgba(0,13,10,0.98), rgba(0,13,10,0.7)); backdrop-filter: blur(30px); }
        .scroll-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default ChatWindow;
