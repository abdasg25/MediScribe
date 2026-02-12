'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth';
import Header from '@/components/shared/Header';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';
import LetterGenerator from '@/components/letters/LetterGenerator';
import LetterList from '@/components/letters/LetterList';
import LetterViewer from '@/components/letters/LetterViewer';
import api from '@/lib/api';
import { Letter, LetterListResponse } from '@/types/letter';
import { Recording, RecordingListResponse } from '@/types/audio';

export default function LettersPage() {
  const router = useRouter();
  const toast = useToast();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/auth/login');
    } else {
      fetchLetters();
      fetchRecordings();
    }
  }, [router, currentPage]);

  const fetchLetters = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<LetterListResponse>(
        `/api/letters?skip=${(currentPage - 1) * pageSize}&limit=${pageSize}`
      );
      setLetters(response.data.letters);
      setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (err: any) {
      console.error('Fetch letters error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to load letters';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecordings = async () => {
    try {
      // Fetch all completed recordings for the generator
      const response = await api.get<RecordingListResponse>(
        `/api/recordings?skip=0&limit=100`
      );
      setRecordings(response.data.recordings.filter(r => r.status === 'completed'));
    } catch (err: any) {
      console.error('Fetch recordings error:', err);
      // Don't show error toast for recordings fetch as it's not critical
    }
  };

  const handleLetterGenerated = async () => {
    // Refresh the list after generation
    await fetchLetters();
    toast.success('Refreshing letter list...');
  };

  const handleLetterDeleted = () => {
    fetchLetters();
  };

  const handleLetterUpdated = (updatedLetter: Letter) => {
    setLetters(letters.map(l => l.id === updatedLetter.id ? updatedLetter : l));
    setSelectedLetter(updatedLetter);
  };

  const handleViewLetter = (letter: Letter) => {
    setSelectedLetter(letter);
  };

  const handleCloseViewer = () => {
    setSelectedLetter(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary-600" />
            Medical Letters
          </h1>
          <p className="text-gray-600">
            Generate AI-powered medical documentation using Qwen3 local LLM
          </p>
        </div>

        {/* Letter Generator */}
        <div className="mb-8">
          <LetterGenerator
            recordings={recordings}
            onLetterGenerated={handleLetterGenerated}
          />
        </div>

        {/* Letters List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Generated Letters
              {!isLoading && letters.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  (Page {currentPage} of {totalPages})
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4">Loading letters...</p>
            </div>
          ) : (
            <>
              <LetterList
                letters={letters}
                onLetterDeleted={handleLetterDeleted}
                onViewLetter={handleViewLetter}
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Letter Viewer Modal */}
      {selectedLetter && (
        <LetterViewer
          letter={selectedLetter}
          onClose={handleCloseViewer}
          onLetterUpdated={handleLetterUpdated}
        />
      )}
    </div>
  );
}
