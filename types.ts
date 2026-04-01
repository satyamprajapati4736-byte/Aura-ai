
export type MessageRole = 'user' | 'assistant' | 'system';

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  type?: 'text' | 'image' | 'video' | 'system';
  mediaUrl?: string;
  status?: 'processing' | 'completed' | 'failed';
  grounding?: GroundingChunk[];
}

export interface AssistantConfig {
  aiName: string;
  ownerName: string;
  voiceEnabled: boolean;
  autoListen: boolean;
  privacyShield: boolean;
  preferredLanguage: string;
  avatarUrl: string;
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  voicePitch?: number;
  voiceSpeed?: number;
  shadowMode: boolean;
  evolutionLevel: number;
  experience: number;
  syncLevel: number;
  neuralDirectives: string[];
}

export enum AppScreen {
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS'
}
