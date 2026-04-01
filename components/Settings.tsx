
import React, { useState } from 'react';
import { AssistantConfig } from '../types';

interface SettingsProps {
  config: AssistantConfig;
  onSave: (config: AssistantConfig) => void;
  avatars: string[];
  privacyShield: boolean;
  onTogglePrivacy: () => void;
}

const Settings: React.FC<SettingsProps> = ({ config, onSave, avatars, privacyShield, onTogglePrivacy }) => {
  const [formData, setFormData] = useState<AssistantConfig>({ ...config });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'range' ? parseFloat(value) : value
    }));
  };

  const handleUnlockCreative = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    } else {
      alert("Creative mode requires a paid billing project.");
    }
  };

  const themeColor = formData.shadowMode ? 'pink' : 'emerald';

  return (
    <div className={`flex-1 p-4 md:p-8 overflow-y-auto ${formData.shadowMode ? 'bg-slate-950' : 'bg-emerald-950/20'}`}>
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <header className="text-center py-6">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Aura Persona Engine</h2>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.4em] mt-2">Neural Security Protocol Active</p>
        </header>

        {/* Privacy Section */}
        <section className="bg-emerald-900/10 p-6 rounded-3xl border border-emerald-500/30 space-y-4">
           <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Privacy Shield</h3>
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Hide chat when window loses focus</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="privacyShield" checked={formData.privacyShield} onChange={handleChange} className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-800 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full peer-checked:after:left-[6px]"></div>
              </label>
           </div>
        </section>

        <section className="bg-slate-900/60 p-6 rounded-3xl border border-emerald-500/20">
          <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest mb-4">Neural Creative Engine</h3>
          <p className="text-[10px] text-slate-400 mb-6 uppercase font-bold tracking-widest">Generate Cinematic 4K Videos & AI Images</p>
          <button 
            type="button"
            onClick={handleUnlockCreative}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-black text-white uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform active:scale-95 shadow-lg shadow-emerald-900/40"
          >
            Unlock Veo Creative Mode
          </button>
        </section>

        <section className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="space-y-4">
            <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Identity Protocol</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="aiName" value={formData.aiName} onChange={handleChange} placeholder="AI Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors" />
              <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Boss Name" className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:border-emerald-500 outline-none transition-colors" />
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Voice Mode</h3>
                  <p className="text-[8px] text-slate-600 uppercase font-bold">Aura will always listen for your voice</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="autoListen" checked={formData.autoListen} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:bg-emerald-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
             <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Voice Synthesis</label>
             <select name="voiceName" value={formData.voiceName} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm outline-none">
                <option value="Kore">Kore (Emotional Human)</option>
                <option value="Zephyr">Zephyr (Cool Neural)</option>
                <option value="Puck">Puck (Cheerful)</option>
                <option value="Charon">Charon (Deep Shadow)</option>
                <option value="Fenrir">Fenrir (Powerful)</option>
             </select>
          </div>
        </section>

        <button onClick={() => onSave(formData)} className="w-full py-5 bg-white text-black font-black rounded-2xl uppercase tracking-[0.3em] text-xs shadow-xl active:scale-95 transition-all">
          Sync Core Protocols
        </button>
      </div>
    </div>
  );
};

export default Settings;
