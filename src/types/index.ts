export type ExpansionMode = 'essay' | 'startup_pitch' | 'rap_verse' | 'counter_argument';
export type ValueMeter = 'unicorn' | 'seedling' | 'trash';
export type VoiceType = 'morgan_freeman' | 'anime_girl' | 'user_clone';

export interface Thought {
  id: string;
  raw_text: string;
  created_at: string;
  mode_selected: ExpansionMode;
  expanded_text?: string;
  voice_url?: string;
  value_meter?: ValueMeter;
  voice_type?: VoiceType;
}

export interface GenerateExpansionRequest {
  thought_id: string;
  raw_text: string;
  mode_selected: ExpansionMode;
}

export interface GenerateVoiceRequest {
  thought_id: string;
  expanded_text: string;
  voice_type?: VoiceType;
}

export interface PostRedditRequest {
  thought_id: string;
  raw_text: string;
  expanded_text: string;
}