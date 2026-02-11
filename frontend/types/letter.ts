export interface Letter {
  id: string;
  user_id: string;
  audio_id: string;
  template_id?: string;
  generated_text: string;
  edited_text?: string;
  status: 'draft' | 'final' | 'exported';
  created_at: string;
  updated_at?: string;
}

export interface LetterTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  base_prompt: string;
  variables?: Record<string, any>;
  is_active: boolean;
  created_at: string;
}

export interface LetterGenerateRequest {
  audio_id: string;
  template_id?: string;
  custom_prompt?: string;
}

export interface LetterGenerateResponse {
  id: string;
  generated_text: string;
  status: string;
}
