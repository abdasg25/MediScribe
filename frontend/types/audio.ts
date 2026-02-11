export interface AudioFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  duration?: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  uploaded_at: string;
}

export interface AudioUploadResponse {
  id: string;
  file_name: string;
  status: string;
  message: string;
}

export interface Transcription {
  id: string;
  audio_id: string;
  text: string;
  language?: string;
  created_at: string;
}
