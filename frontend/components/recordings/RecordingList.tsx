'use client';

import { useState } from 'react';
import { FileAudio, Trash2, Play, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import api from '@/lib/api';
import { useToast } from '@/components/shared/Toast';
import { Recording, TranscriptionResponse } from '@/types/audio';

interface RecordingListProps {
 recordings: Recording[];
  onDelete: (id: string) => void;
  onTranscribe: (recording: Recording) => void;
}

export default function RecordingList({ recordings, onDelete, onTranscribe }: RecordingListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const toast = useToast();

  const handleDelete = async (recording: Recording) => {
    if (!confirm(`Are you sure you want to delete "${recording.filename}"?`)) {
      return;
    }

    setDeletingId(recording.id);

    try {
      await api.delete(`/api/recordings/${recording.id}`);
      toast.success('Recording deleted successfully');
      onDelete(recording.id);
    } catch (err: any) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to delete recording';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleTranscribe = async (recording: Recording) => {
    setTranscribingId(recording.id);

    try {
      const response = await api.post<TranscriptionResponse>(
        `/api/recordings/${recording.id}/transcribe`
      );
      
      toast.success('Transcription completed successfully!');
      onTranscribe({
        ...recording,
        transcription: response.data.transcription,
        status: response.data.status,
        transcribed_at: response.data.transcribed_at,
      });
    } catch (err: any) {
      console.error('Transcription error:', err);
      const errorMessage = err.response?.data?.detail || 'Transcription failed';
      toast.error(errorMessage);
    } finally {
      setTranscribingId(null);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (status: Recording['status']) => {
    const badges = {
      uploading: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Uploading' },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: Loader2, label: 'Processing' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Failed' },
    };

    const badge = badges[status];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className={`mr-1 h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {badge.label}
      </span>
    );
  };

  if (recordings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <FileAudio className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recordings yet</h3>
        <p className="text-sm text-gray-500">
          Upload your first audio recording to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Your Recordings</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {recordings.map((recording) => (
          <div key={recording.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <FileAudio className="h-5 w-5 text-primary-600 flex-shrink-0" />
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {recording.filename}
                  </h3>
                  {getStatusBadge(recording.status)}
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <span>{formatDate(recording.created_at)}</span>
                  <span>•</span>
                  <span>{formatFileSize(recording.file_size)}</span>
                  {recording.duration && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(recording.duration)}</span>
                    </>
                  )}
                </div>

                {recording.transcription && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {recording.transcription}
                    </p>
                  </div>
                )}

                {recording.error_message && (
                  <div className="mt-3 p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Error:</strong> {recording.error_message}
                    </p>
                  </div>
                )}
              </div>

              <div className="ml-4 flex-shrink-0 flex space-x-2">
                {recording.status === 'uploading' && !recording.transcription && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleTranscribe(recording)}
                    disabled={transcribingId === recording.id}
                    isLoading={transcribingId === recording.id}
                  >
                    {transcribingId === recording.id ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Transcribing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Transcribe
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(recording)}
                  disabled={deletingId === recording.id}
                  isLoading={deletingId === recording.id}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
