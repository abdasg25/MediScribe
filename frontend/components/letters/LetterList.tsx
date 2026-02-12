'use client';

import { useState } from 'react';
import { FileText, Eye, Edit, Trash2, Copy, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import Button from '@/components/shared/Button';
import Card from '@/components/shared/Card';
import { useToast } from '@/components/shared/Toast';
import api from '@/lib/api';
import { Letter, LETTER_TYPE_LABELS } from '@/types/letter';

interface LetterListProps {
  letters: Letter[];
  onLetterDeleted?: (letterId: string) => void;
  onViewLetter?: (letter: Letter) => void;
}

export default function LetterList({ letters, onLetterDeleted, onViewLetter }: LetterListProps) {
  const toast = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  const handleDelete = async (letterId: string) => {
    if (!confirm('Are you sure you want to delete this letter?')) {
      return;
    }

    setDeletingId(letterId);

    try {
      await api.delete(`/api/letters/${letterId}`);
      toast.success('Letter deleted successfully');
      if (onLetterDeleted) {
        onLetterDeleted(letterId);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to delete letter';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (content: string, letterId: string) => {
    setCopyingId(letterId);

    try {
      await navigator.clipboard.writeText(content);
      toast.success('Letter copied to clipboard');
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Failed to copy to clipboard');
    } finally {
      setTimeout(() => setCopyingId(null), 1000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (letters.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No letters yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate your first medical letter above
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {letters.map((letter) => (
        <Card key={letter.id} hover>
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {LETTER_TYPE_LABELS[letter.letter_type]}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(letter.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(letter.status)}
              </div>
            </div>

            {/* Patient Info */}
            {(letter.patient_name || letter.patient_age || letter.patient_gender) && (
              <div className="flex items-center space-x-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {letter.patient_name && (
                  <span>
                    <strong>Patient:</strong> {letter.patient_name}
                  </span>
                )}
                {letter.patient_age && (
                  <span>
                    <strong>Age:</strong> {letter.patient_age}
                  </span>
                )}
                {letter.patient_gender && (
                  <span>
                    <strong>Gender:</strong> {letter.patient_gender}
                  </span>
                )}
              </div>
            )}

            {/* Content Preview */}
            {letter.status === 'completed' && letter.content && (
              <div className="border-t pt-4">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white border rounded-lg p-4 max-h-40 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap">
                    {letter.content.substring(0, 400)}
                    {letter.content.length > 400 && '...'}
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {letter.status === 'failed' && letter.error_message && (
              <div className="border-t pt-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {letter.error_message}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                {letter.status === 'completed' && (
                  <>
                    {onViewLetter && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewLetter(letter)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View Full
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(letter.content, letter.id)}
                      disabled={copyingId === letter.id}
                    >
                      {copyingId === letter.id ? (
                        <>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(letter.id)}
                isLoading={deletingId === letter.id}
                disabled={deletingId === letter.id}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
