export type LetterType =
  | 'referral'
  | 'consultation'
  | 'discharge_summary'
  | 'medical_report'
  | 'prescription'
  | 'sick_note'
  | 'other';

export type LetterStatus = 'generating' | 'completed' | 'failed';

export interface Letter {
  id: string;
  user_id: string;
  recording_id?: string;
  letter_type: LetterType;
  title: string;
  content: string;
  patient_name?: string;
  patient_age?: string;
  patient_gender?: string;
  status: LetterStatus;
  created_at: string;
  updated_at: string;
  error_message?: string;
}

export interface LetterListResponse {
  letters: Letter[];
  total: number;
  page: number;
  page_size: number;
}

export interface GenerateLetterRequest {
  letter_type: LetterType;
  transcription?: string;
  recording_id?: string;
  patient_name?: string;
  patient_age?: string;
  patient_gender?: string;
  custom_instructions?: string;
}

export interface GenerateLetterResponse {
  letter_id: string;
  content: string;
  status: LetterStatus;
  created_at: string;
}

export const LETTER_TYPE_LABELS: Record<LetterType, string> = {
  referral: 'Referral Letter',
  consultation: 'Consultation Note',
  discharge_summary: 'Discharge Summary',
  medical_report: 'Medical Report',
  prescription: 'Prescription',
  sick_note: 'Sick Note / Medical Certificate',
  other: 'Other Medical Letter',
};
