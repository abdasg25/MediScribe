'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, Upload as UploadIcon } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/shared/Header';
import AudioRecorder from '@/components/recordings/AudioRecorder';
import AudioUpload from '@/components/recordings/AudioUpload';
import RecordingList from '@/components/recordings/RecordingList';
import { useToast } from '@/components/shared/Toast';
import api from '@/lib/api';
import { Recording, RecordingListResponse } from '@/types/audio';

type Tab = 'record' | 'upload';

export default function RecordingPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
      return;
    }

    fetchRecordings();
  }, [router, page]);

  const fetchRecordings = async () => {
    setIsLoading(true);
    try {
      const skip = (page - 1) * pageSize;
      const response = await api.get<RecordingListResponse>(
        `/api/recordings?skip=${skip}&limit=${pageSize}`
      );
      
      setRecordings(response.data.recordings);
      setTotal(response.data.total);
    } catch (err: any) {
      console.error('Failed to fetch recordings:', err);
      
      if (err.response?.status !== 401) {
        toast.error('Failed to load recordings');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadComplete = (newRecording: Recording) => {
    setRecordings((prev) => [newRecording, ...prev]);
    setTotal((prev) => prev + 1);
  };

  const handleDelete = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id));
    setTotal((prev) => prev - 1);
  };

  const handleTranscribe = (updatedRecording: Recording) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === updatedRecording.id ? updatedRecording : r))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audio Recordings</h1>
          <p className="text-gray-600">
            Record consultations or upload audio files and transcribe them using AI
          </p>
        </div>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('record')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'record'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mic className="h-5 w-5" />
                Record
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UploadIcon className="h-5 w-5" />
                Upload
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'record' && (
            <AudioRecorder onRecordingUploaded={fetchRecordings} />
          )}

          {activeTab === 'upload' && (
            <AudioUpload onUploadComplete={handleUploadComplete} />
          )}

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading recordings...</p>
            </div>
          ) : (
            <RecordingList
              recordings={recordings}
              onDelete={handleDelete}
              onTranscribe={handleTranscribe}
            />
          )}

          {total > pageSize && (
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

