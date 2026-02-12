'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Loader2, User, Calendar, Users } from 'lucide-react';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import Card from '@/components/shared/Card';
import api from '@/lib/api';
import { useToast } from '@/components/shared/Toast';
import {
  GenerateLetterRequest,
  GenerateLetterResponse,
  LetterType,
  LETTER_TYPE_LABELS,
} from '@/types/letter';
import { Recording } from '@/types/audio';

interface LetterGeneratorProps {
  recordings?: Recording[];
  onLetterGenerated?: (letterId: string) => void;
}

export default function LetterGenerator({ recordings = [], onLetterGenerated }: LetterGeneratorProps) {
  const router = useRouter();
  const toast = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<GenerateLetterRequest>({
    letter_type: 'consultation',
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    recording_id: '',
    transcription: '',
    custom_instructions: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.recording_id && !formData.transcription) {
      toast.error('Please select a recording or provide transcription text');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare request data
      const requestData: GenerateLetterRequest = {
        letter_type: formData.letter_type,
        patient_name: formData.patient_name || undefined,
        patient_age: formData.patient_age || undefined,
        patient_gender: formData.patient_gender || undefined,
        custom_instructions: formData.custom_instructions || undefined,
      };

      if (formData.recording_id) {
        requestData.recording_id = formData.recording_id;
      } else {
        requestData.transcription = formData.transcription;
      }

      const response = await api.post<GenerateLetterResponse>('/api/letters/generate', requestData);

      toast.success('Letter generated successfully!');
      
      if (onLetterGenerated) {
        onLetterGenerated(response.data.letter_id);
      } else {
        router.push(`/letters`);
      }
    } catch (err: any) {
      console.error('Letter generation error:', err);

      if (err.response?.data?.formattedDetail) {
        toast.error(err.response.data.formattedDetail);
      } else {
        const errorMessage = err.response?.data?.detail || 'Failed to generate letter. Please try again.';
        toast.error(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const completedRecordings = recordings.filter(r => r.status === 'completed' && r.transcription);

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate Medical Letter</h2>
          <p className="text-gray-600">Create AI-powered medical documentation using Qwen3</p>
        </div>

        {/* Letter Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Letter Type *
          </label>
          <select
            value={formData.letter_type}
            onChange={(e) => setFormData({ ...formData, letter_type: e.target.value as LetterType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            {(Object.keys(LETTER_TYPE_LABELS) as LetterType[]).map((type) => (
              <option key={type} value={type}>
                {LETTER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Source Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source
          </label>
          <div className="space-y-3">
            {completedRecordings.length > 0 && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select from recordings</label>
                <select
                  value={formData.recording_id}
                  onChange={(e) =>
                    setFormData({ ...formData, recording_id: e.target.value, transcription: '' })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">-- Select a recording --</option>
                  {completedRecordings.map((recording) => (
                    <option key={recording.id} value={recording.id}>
                      {recording.filename} ({new Date(recording.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-600 mb-1">Or paste transcription text</label>
              <textarea
                value={formData.transcription}
                onChange={(e) =>
                  setFormData({ ...formData, transcription: e.target.value, recording_id: '' })
                }
                placeholder="Paste consultation notes or transcription here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                disabled={!!formData.recording_id}
              />
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="mr-2 h-5 w-5" />
            Patient Information (Optional)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Patient Name"
              placeholder="e.g., John Doe"
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
            />
            <Input
              label="Age"
              placeholder="e.g., 45"
              value={formData.patient_age}
              onChange={(e) => setFormData({ ...formData, patient_age: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={formData.patient_gender}
                onChange={(e) => setFormData({ ...formData, patient_gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={formData.custom_instructions}
            onChange={(e) => setFormData({ ...formData, custom_instructions: e.target.value })}
            placeholder="E.g., Focus on cardiovascular assessment, mention family history..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> Generation may take 10-60 seconds
          </p>
          <Button type="submit" disabled={isGenerating} isLoading={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Letter
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
