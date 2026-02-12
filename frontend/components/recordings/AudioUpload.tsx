'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, File as FileIcon, X, Loader2 } from 'lucide-react';
import Button from '@/components/shared/Button';
import api from '@/lib/api';
import { useToast } from '@/components/shared/Toast';
import { Recording } from '@/types/audio';

interface AudioUploadProps {
  onUploadComplete: (recording: Recording) => void;
}

const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/flac', 'audio/webm'];
const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export default function AudioUpload({ onUploadComplete }: AudioUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload an audio file (MP3, WAV, M4A, OGG, FLAC, WebM)');
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      toast.error('File size exceeds 100MB limit');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await api.post<Recording>('/api/recordings/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setUploadProgress(progress);
        },
      });

      toast.success('Audio file uploaded successfully!');
      setSelectedFile(null);
      setUploadProgress(0);
      onUploadComplete(response.data);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      
      if (err.response?.data?.formattedDetail) {
        toast.error(err.response.data.formattedDetail);
      } else if (err.response?.status === 413) {
        toast.error('File size too large. Maximum size is 100MB.');
      } else {
        const errorMessage = err.response?.data?.detail || 'Upload failed. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Audio Recording</h2>

      {!selectedFile ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500 mb-4">
            MP3, WAV, M4A, OGG, FLAC, or WebM (max 100MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_TYPES.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="audio-upload"
          />
          <label htmlFor="audio-upload">
            <Button type="button" onClick={() => fileInputRef.current?.click()}>
              Select File
            </Button>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileIcon className="h-8 w-8 text-primary-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={handleClear}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {isUploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              isLoading={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
            {!isUploading && (
              <Button variant="secondary" onClick={handleClear}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p><strong>Note:</strong> Uploaded recordings will be automatically processed for transcription.</p>
      </div>
    </div>
  );
}
