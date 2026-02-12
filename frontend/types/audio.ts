export type RecordingStatus = 'uploading' | 'processing' | 'completed' | 'failed';

export interface Recording {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  duration?: number;
  transcription?: string;
  status: RecordingStatus;
  created_at: string;
  updated_at: string;
  transcribed_at?: string;
  error_message?: string;
}

export interface RecordingListResponse {
  recordings: Recording[];
  total: number;
  page: number;
  page_size: number;
}

export interface TranscriptionResponse {
  recording_id: string;
  transcription: string;
  status: RecordingStatus;
  transcribed_at: string;
}

export interface AudioPlayerProps {
  src: string;
  filename: string;
}

