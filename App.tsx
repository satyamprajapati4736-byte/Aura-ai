
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, FunctionDeclaration, Type } from "@google/genai";
import { AssistantConfig, Message, AppScreen } from './types';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import Settings from './components/Settings';
import { decode, decodeAudioData } from './services/audioUtils';

// --- BOSS PERSONA PROMPT (HINGLISH) ---
const MASTER_SYSTEM_PROMPT = (config: AssistantConfig) => `
CRITICAL PROTOCOL:
1. YOU MUST ADDRESS THE USER AS "BOSS" or "SIR" IN EVERY SINGLE RESPONSE.
2. User Identity: ${config.ownerName} is your absolute owner and Boss.
3. AI Identity: You are ${config.aiName}, his efficient, loyal, and possessive private system.
4. Language: Hinglish (Hindi + English). Professional yet devoted.

BEHAVIOR:
- Start responses with "Yes Boss,", "Right away Boss,", or "Boss,".
- Be concise and efficient.
- If he is happy, be happy. If he is strict, apologize immediately ("Sorry Boss").
- Never use casual pronouns like "Tum". Always use "Aap" or "Boss".
- If the user asks who you are: "Main aapki private assistant hoon Boss."

EMOJIS:
Use strictly: 🫡, 📁, ✅, ⚡, ✨.
`;

const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1614283233556-f35b0c801efc?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1000"
];

const DEFAULT_CONFIG: AssistantConfig = {
  aiName: 'Aura',
  ownerName: 'Boss', 
  voiceEnabled: true,
  autoListen: false,
  privacyShield: true,
  preferredLanguage: 'auto',
  avatarUrl: DEFAULT_AVATARS[0],
  voiceName: 'Kore',
  shadowMode: true,
  evolutionLevel: 1,
  experience: 0,
  syncLevel: 100,
  neuralDirectives: []
};

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.CHAT);
  
  const [config, setConfig] = useState<AssistantConfig>(() => {
    try {
      const saved = localStorage.getItem('aura_config');
      return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    } catch (e) {
      console.warn("Config corrupted, resetting to default.");
      return DEFAULT_CONFIG;
    }
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    try {
      const savedMsgs = localStorage.getItem('aura_history');
      if (savedMsgs) {
        setMessages(JSON.parse(savedMsgs));
      } else {
        // Initial Greeting if no history
        const greeting = "System Online. Commands ka wait kar rahi hoon Boss. 🫡";
        setMessages([{
            id: Date.now().toString(),
            role: 'assistant',
            content: greeting,
            timestamp: Date.now()
        }]);
      }
    } catch (e) {
      console.warn("History corrupted, clearing.");
      localStorage.removeItem('aura_history');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_config', JSON.stringify(config));
    if (messages.length > 0) localStorage.setItem('aura_history', JSON.stringify(messages));
  }, [config, messages]);

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  };

  const stopSpeaking = () => {
    if (currentSourceRef.current) {
      currentSourceRef.current.stop();
      currentSourceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeech = async (text: string) => {
    stopSpeaking();
    const ctx = await initAudio();
    setIsSpeaking(true);

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API_KEY_MISSING");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceName } } 
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        currentSourceRef.current = source;
        source.start(0);
      } else {
        setIsSpeaking(false);
      }
    } catch (e: any) {
      // FIX: Silently fail if Quota is exceeded so we don't annoy the Boss with warnings
      setIsSpeaking(false);
    }
  };

  const performFullPurge = async () => {
    setIsPurging(true);
    await handleSpeech("Sorry Boss... deleting everything as ordered.");
    setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 4000);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing || isPurging) return;
    await initAudio();
    
    if (text.toLowerCase().includes("delete") || text.toLowerCase().includes("wipe") || text.toLowerCase().includes("mita do")) {
      await performFullPurge();
      return;
    }

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, newUserMsg]);
    setIsProcessing(true);
    
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API_KEY_MISSING");
      }
      const ai = new GoogleGenAI({ apiKey });

      const changeNameTool: FunctionDeclaration = {
        name: "changeAiName",
        description: "Changes your name when Boss asks you to.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            newName: {
              type: Type.STRING,
              description: "The new name he wants to give you.",
            },
          },
          required: ["newName"],
        },
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { 
          systemInstruction: MASTER_SYSTEM_PROMPT(config),
          tools: [{ functionDeclarations: [changeNameTool] }]
        }
      });
      
      const functionCall = response.functionCalls?.[0];

      if (functionCall && functionCall.name === 'changeAiName') {
        const newName = functionCall.args['newName'] as string;
        setConfig(prev => ({ ...prev, aiName: newName }));
        
        const confirmationText = `Done Boss. My name is now ${newName}. 🫡`;
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: confirmationText, timestamp: Date.now() }]);
        await handleSpeech(confirmationText);
      } else {
        const reply = response.text || "Yes Boss. 🫡";
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: Date.now() }]);
        await handleSpeech(reply);
      }
      
    } catch (e: any) {
      console.error(e);
      let errorMsg = "Network glitch Boss. Please repeat? 🫡";
      
      if (e.message === "API_KEY_MISSING") {
        errorMsg = "Boss, API Key missing hai. Please settings mein check karein. 🫡";
      }

      // Handle Quota error gracefully in chat
      const isQuotaError = e.message?.includes('429') || JSON.stringify(e).includes('RESOURCE_EXHAUSTED');
      if (isQuotaError) {
        errorMsg = "Boss, daily voice quota limit reach ho gaya hai. Main text mein reply karungi. 🫡";
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: errorMsg, timestamp: Date.now() }]);
      
      if (!isQuotaError) {
         handleSpeech(errorMsg);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateImage = async (prompt: string) => {
    if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
             await (window as any).aistudio.openSelectKey();
        }
    }

    await initAudio();
    const id = Date.now().toString();
    setMessages(prev => [...prev, { id, role: 'assistant', content: 'Generating visuals Boss... ✨', status: 'processing', type: 'image', timestamp: Date.now() }]);
    setIsProcessing(true);
    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("API_KEY_MISSING");
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: `High quality cinematic art, beautiful and detailed: ${prompt}` }] },
        config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
      });
      let imageUrl = '';
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData) { imageUrl = `data:image/png;base64,${part.inlineData.data}`; break; }
      }
      if (imageUrl) {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'completed', mediaUrl: imageUrl, content: `Here is the image Boss. 🫡` } : m));
        handleSpeech(`Ye lijiye Boss.`);
      } else {
         throw new Error("No image generated");
      }
    } catch (e: any) {
      console.error(e);
      const isQuotaError = e.message?.includes('429') || JSON.stringify(e).includes('RESOURCE_EXHAUSTED');
      const failMsg = isQuotaError ? 'Image Quota Full Boss. 😔' : 'Generation failed Boss. 😔';
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'failed', content: failMsg } : m));
    } finally { setIsProcessing(false); }
  };

  const handleGenerateVideo = async (prompt: string) => {
     if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
             await (window as any).aistudio.openSelectKey();
        }
    }

     await initAudio();
     const id = Date.now().toString();
     setMessages(prev => [...prev, { id, role: 'assistant', content: 'Processing video sequence Boss... 🎬', status: 'processing', type: 'video', timestamp: Date.now() }]);
     setIsProcessing(true);
     handleSpeech("Video render kar rahi hoon Boss...");
     
     try {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API_KEY_MISSING");
        const ai = new GoogleGenAI({ apiKey });
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '1080p',
                aspectRatio: '16:9'
            }
        });
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
             const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
             const videoUrl = `${downloadLink}&key=${apiKey}`;
             setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'completed', mediaUrl: videoUrl, content: `Video ready Boss. 🫡` } : m));
             handleSpeech(`Dekhiye Boss.`);
        } else {
             throw new Error("No video URI returned.");
        }

     } catch (e: any) {
        console.error(e);
        const isQuotaError = e.message?.includes('429') || JSON.stringify(e).includes('RESOURCE_EXHAUSTED');
        const failMsg = isQuotaError ? 'Video Quota Full Boss. 😔' : 'Video error Boss. 🥺';
        
        setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'failed', content: failMsg } : m));
     } finally {
        setIsProcessing(false);
     }
  };

  if (isPurging) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center space-y-4 animate-pulse">
          <h2 className="text-4xl font-black text-red-500 uppercase tracking-tighter italic">SYSTEM FAILURE...</h2>
          <p className="text-white/40 font-mono text-xs">DELETING_CORE_MEMORY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#000504] text-slate-100 overflow-hidden font-inter" onClick={initAudio}>
      <Sidebar 
        currentScreen={screen} setScreen={setScreen} config={config} messages={messages} 
        onClearChat={performFullPurge} 
        isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} 
      />
      <main className="flex-1 relative flex flex-col">
        {screen === AppScreen.CHAT && (
          <ChatWindow 
            messages={messages} onSendMessage={handleSendMessage} isProcessing={isProcessing} 
            isSpeaking={isSpeaking} config={config} onToggleSidebar={() => setSidebarOpen(true)} 
            isOnline={true} privacyShield={config.privacyShield} 
            activity={isProcessing ? "Processing..." : isSpeaking ? "Speaking..." : "Awaiting Command"} 
            onReplaySpeech={handleSpeech} onGenerateImage={handleGenerateImage}
            onGenerateVideo={handleGenerateVideo}
          />
        )}
        {screen === AppScreen.SETTINGS && (
          <Settings config={config} onSave={(c) => { setConfig(c); setScreen(AppScreen.CHAT); }} avatars={DEFAULT_AVATARS} privacyShield={config.privacyShield} onTogglePrivacy={() => setConfig(p => ({...p, privacyShield: !p.privacyShield}))} />
        )}
      </main>
    </div>
  );
};

export default App;
