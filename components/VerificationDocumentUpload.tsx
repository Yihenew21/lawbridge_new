'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Loader2, CheckCircle } from 'lucide-react';

interface VerificationDocumentUploadProps {
  onUploadComplete: (documentUrls: string[]) => void;
  existingDocuments?: string[];
}

export default function VerificationDocumentUpload({
  onUploadComplete,
  existingDocuments = [],
}: VerificationDocumentUploadProps) {
  const [documents, setDocuments] = useState<string[]>(existingDocuments);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));

    if (invalidFiles.length > 0) {
      setError('Only PDF, JPEG, PNG, and WebP files are allowed');
      return;
    }

    // Validate file sizes (10MB each)
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Each file must be less than 10MB');
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    setError('');
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one document');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });

      const response = await fetch('/api/lawyers/verification/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newDocuments = [...documents, ...data.documentUrls];
        setDocuments(newDocuments);
        setSelectedFiles([]);
        onUploadComplete(newDocuments);
      } else {
        setError(data.error || 'Failed to upload documents');
      }
    } catch (error) {
      setError('An error occurred while uploading documents');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-500 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mb-4">
          PDF, JPEG, PNG or WebP (max 10MB each)
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Select Files
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Selected Files</h4>
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeSelectedFile(index)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={uploadDocuments}
            disabled={isUploading}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Documents'
            )}
          </button>
        </div>
      )}

      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Uploaded Documents</h4>
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-gray-900">{doc.split('/').pop()}</p>
              </div>
              <a
                href={doc}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                View
              </a>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
