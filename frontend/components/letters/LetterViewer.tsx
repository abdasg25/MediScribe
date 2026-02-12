'use client';

import { useState } from 'react';
import { X, Copy, Download, Edit, Save, CheckCircle } from 'lucide-react';
import Button from '@/components/shared/Button';
import { useToast } from '@/components/shared/Toast';
import api from '@/lib/api';
import { Letter, LETTER_TYPE_LABELS } from '@/types/letter';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface LetterViewerProps {
  letter: Letter;
  onClose: () => void;
  onLetterUpdated?: (updatedLetter: Letter) => void;
}

// Helper function to convert markdown to HTML
function formatLetterContent(content: string): string {
  let html = content
    // Convert headers
    .replace(/^#### (.+)$/gm, '<h4 class="text-lg font-semibold mt-6 mb-3 text-gray-800">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4 text-gray-900">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-5 text-gray-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-12 mb-6 text-gray-900">$1</h1>')
    // Convert bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    // Convert line breaks to paragraphs
    .split('\n\n')
    .map(para => para.trim() ? `<p class="mb-4">${para.replace(/\n/g, '<br>')}</p>` : '')
    .join('');
  
  return html;
}

export default function LetterViewer({ letter, onClose, onLetterUpdated }: LetterViewerProps) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(letter.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await api.patch<Letter>(`/api/letters/${letter.id}`, {
        content: editedContent,
      });

      toast.success('Letter updated successfully');
      setIsEditing(false);

      if (onLetterUpdated) {
        onLetterUpdated(response.data);
      }
    } catch (err: any) {
      console.error('Update error:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to update letter';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    setIsCopying(true);

    try {
      await navigator.clipboard.writeText(editedContent);
      toast.success('Letter copied to clipboard');
    } catch (err) {
      console.error('Copy error:', err);
      toast.error('Failed to copy to clipboard');
    } finally {
      setTimeout(() => setIsCopying(false), 1000);
    }
  };

  const handleExport = async (format: 'txt' | 'pdf' | 'docx') => {
    const filename = `${LETTER_TYPE_LABELS[letter.letter_type]}_${letter.patient_name || 'Letter'}_${
      new Date().toISOString().split('T')[0]
    }`;

    try {
      if (format === 'txt') {
        // Export as TXT
        const blob = new Blob([editedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Letter exported as TXT');
      } else if (format === 'pdf') {
        // Export as PDF using jsPDF
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - 2 * margin;
        let yPosition = margin;

        // Add header
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(LETTER_TYPE_LABELS[letter.letter_type], margin, yPosition);
        yPosition += 10;

        // Add patient info
        if (letter.patient_name || letter.patient_age || letter.patient_gender) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          if (letter.patient_name) {
            doc.text(`Patient: ${letter.patient_name}`, margin, yPosition);
            yPosition += 6;
          }
          if (letter.patient_age || letter.patient_gender) {
            const info = [];
            if (letter.patient_age) info.push(`Age: ${letter.patient_age}`);
            if (letter.patient_gender) info.push(`Gender: ${letter.patient_gender}`);
            doc.text(info.join(', '), margin, yPosition);
            yPosition += 6;
          }
          yPosition += 4;
        }

        // Add content
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        
        // Split content into lines and handle markdown
        const lines = editedContent.split('\n');
        for (const line of lines) {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }

          // Handle markdown headers
          if (line.startsWith('### ')) {
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            const text = line.replace(/^### /, '');
            const wrappedText = doc.splitTextToSize(text, maxLineWidth);
            doc.text(wrappedText, margin, yPosition);
            yPosition += wrappedText.length * 6;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
          } else if (line.startsWith('#### ')) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            const text = line.replace(/^#### /, '');
            const wrappedText = doc.splitTextToSize(text, maxLineWidth);
            doc.text(wrappedText, margin, yPosition);
            yPosition += wrappedText.length * 5;
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
          } else if (line.trim()) {
            const cleanLine = line.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
            const wrappedText = doc.splitTextToSize(cleanLine, maxLineWidth);
            doc.text(wrappedText, margin, yPosition);
            yPosition += wrappedText.length * 5;
          } else {
            yPosition += 5;
          }
        }

        doc.save(`${filename}.pdf`);
        toast.success('Letter exported as PDF');
      } else if (format === 'docx') {
        // Export as DOCX using docx library
        const paragraphs: Paragraph[] = [];

        // Add header
        paragraphs.push(
          new Paragraph({
            text: LETTER_TYPE_LABELS[letter.letter_type],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          })
        );

        // Add patient info
        if (letter.patient_name || letter.patient_age || letter.patient_gender) {
          const patientInfo: string[] = [];
          if (letter.patient_name) patientInfo.push(`Patient: ${letter.patient_name}`);
          if (letter.patient_age) patientInfo.push(`Age: ${letter.patient_age}`);
          if (letter.patient_gender) patientInfo.push(`Gender: ${letter.patient_gender}`);
          
          patientInfo.forEach(info => {
            paragraphs.push(
              new Paragraph({
                text: info,
                spacing: { after: 100 },
              })
            );
          });
          
          paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
        }

        // Add content with markdown parsing
        const lines = editedContent.split('\n');
        for (const line of lines) {
          if (line.startsWith('### ')) {
            paragraphs.push(
              new Paragraph({
                text: line.replace(/^### /, ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 300, after: 150 },
              })
            );
          } else if (line.startsWith('#### ')) {
            paragraphs.push(
              new Paragraph({
                text: line.replace(/^#### /, ''),
                heading: HeadingLevel.HEADING_3,
                spacing: { before: 200, after: 100 },
              })
            );
          } else if (line.trim()) {
            // Handle bold and italic
            const runs: TextRun[] = [];
            const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/);
            
            parts.forEach(part => {
              if (part.startsWith('**') && part.endsWith('**')) {
                runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
              } else if (part.startsWith('*') && part.endsWith('*')) {
                runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
              } else if (part) {
                runs.push(new TextRun({ text: part }));
              }
            });

            paragraphs.push(
              new Paragraph({
                children: runs,
                spacing: { after: 100 },
              })
            );
          } else {
            paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
          }
        }

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${filename}.docx`);
        toast.success('Letter exported as DOCX');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {LETTER_TYPE_LABELS[letter.letter_type]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Created: {new Date(letter.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Patient Info */}
        {(letter.patient_name || letter.patient_age || letter.patient_gender) && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-6 text-sm">
              {letter.patient_name && (
                <div>
                  <span className="font-medium text-gray-700">Patient:</span>{' '}
                  <span className="text-gray-900">{letter.patient_name}</span>
                </div>
              )}
              {letter.patient_age && (
                <div>
                  <span className="font-medium text-gray-700">Age:</span>{' '}
                  <span className="text-gray-900">{letter.patient_age}</span>
                </div>
              )}
              {letter.patient_gender && (
                <div>
                  <span className="font-medium text-gray-700">Gender:</span>{' '}
                  <span className="text-gray-900">{letter.patient_gender}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isEditing ? (
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full h-full min-h-[400px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none font-mono text-sm"
              autoFocus
            />
          ) : (
            <div className="prose prose-sm max-w-none">
              <div 
                className="bg-white whitespace-pre-wrap font-serif text-base leading-relaxed text-gray-900"
                dangerouslySetInnerHTML={{ 
                  __html: formatLetterContent(editedContent) 
                }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={isSaving || editedContent === letter.content}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(letter.content);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopy}
                  disabled={isCopying}
                >
                  {isCopying ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <div className="relative group">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                    <button
                      onClick={() => handleExport('txt')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      TXT
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => handleExport('docx')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      DOCX
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
