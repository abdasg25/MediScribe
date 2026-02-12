'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Pause, Play, Upload, Trash2, Loader2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import { useToast } from '@/components/shared/Toast';
import api from '@/lib/api';

interface AudioRecorderProps {
  onRecordingUploaded?: () => void;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export default function AudioRecorder({ onRecordingUploaded }: AudioRecorderProps) {
  const toast = useToast();
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Check browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      toast.error('Audio recording is not supported in your browser');
    }

    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  useEffect(() => {
    // Update timer
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setRecordingState('recording');
      setDuration(0);
      toast.success('Recording started');
    } catch (error: any) {
      console.error('Recording error:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone access denied. Please allow microphone permissions.');
      } else {
        toast.error('Failed to start recording. Please check your microphone.');
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      toast.info('Recording paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      toast.info('Recording resumed');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
      toast.success('Recording stopped');
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingState('idle');
    setDuration(0);
    chunksRef.current = [];
    toast.info('Recording discarded');
  };

  const uploadRecording = async () => {
    if (!audioBlob) return;

    setIsUploading(true);

    try {
      const filename = `recording-${new Date().toISOString().split('T')[0]}-${Date.now()}.webm`;
      const file = new File([audioBlob], filename, { type: audioBlob.type });

      const formData = new FormData();
      formData.append('file', file);

      await api.post('/api/recordings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Recording uploaded successfully!');
      discardRecording();

      if (onRecordingUploaded) {
        onRecordingUploaded();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload recording');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Mic className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Recording Not Supported
          </h3>
          <p className="text-gray-600">
            Your browser doesn't support audio recording. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <Mic className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Record Audio</h2>
            <p className="text-sm text-gray-600">
              Record consultations directly from your browser
            </p>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="bg-gray-50 rounded-lg p-8 mb-6">
          {/* Visual Indicator */}
          <div className="flex flex-col items-center mb-6">
            {recordingState === 'recording' && (
              <div className="relative mb-4">
                <div className="w-24 h-24 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                  <Mic className="h-12 w-12 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 rounded-full animate-ping"></div>
              </div>
            )}

            {recordingState === 'paused' && (
              <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Pause className="h-12 w-12 text-white" />
              </div>
            )}

            {(recordingState === 'idle' || recordingState === 'stopped') && (
              <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center mb-4">
                <Mic className="h-12 w-12 text-gray-600" />
              </div>
            )}

            {/* Duration Display */}
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                {formatDuration(duration)}
              </div>
              <div className="text-sm text-gray-600">
                {recordingState === 'recording' && 'Recording...'}
                {recordingState === 'paused' && 'Paused'}
                {recordingState === 'stopped' && 'Recording Complete'}
                {recordingState === 'idle' && 'Ready to Record'}
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          {recordingState === 'idle' && (
            <div className="flex justify-center">
              <Button onClick={startRecording} size="lg" className="px-8">
                <Mic className="mr-2 h-5 w-5" />
                Start Recording
              </Button>
            </div>
          )}

          {recordingState === 'recording' && (
            <div className="flex justify-center gap-4">
              <Button onClick={pauseRecording} variant="secondary" size="lg">
                <Pause className="mr-2 h-5 w-5" />
                Pause
              </Button>
              <Button onClick={stopRecording} variant="ghost" size="lg">
                <Square className="mr-2 h-5 w-5" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === 'paused' && (
            <div className="flex justify-center gap-4">
              <Button onClick={resumeRecording} size="lg">
                <Play className="mr-2 h-5 w-5" />
                Resume
              </Button>
              <Button onClick={stopRecording} variant="ghost" size="lg">
                <Square className="mr-2 h-5 w-5" />
                Stop
              </Button>
            </div>
          )}

          {recordingState === 'stopped' && audioUrl && (
            <div className="space-y-4">
              {/* Audio Preview */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview Recording:</p>
                <audio controls className="w-full" src={audioUrl}>
                  Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-gray-500 mt-2">
                  Size: {(audioBlob!.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Button
                  onClick={uploadRecording}
                  disabled={isUploading}
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-5 w-5" />
                      Upload Recording
                    </>
                  )}
                </Button>
                <Button
                  onClick={discardRecording}
                  variant="ghost"
                  disabled={isUploading}
                  size="lg"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Recording Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure you're in a quiet environment for best results</li>
            <li>• Speak clearly and at a steady pace</li>
            <li>• Use the pause feature if you need to collect your thoughts</li>
            <li>• Preview your recording before uploading</li>
            <li>• Once uploaded, you can transcribe the recording using AI</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
