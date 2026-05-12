'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Loader2, X, User } from 'lucide-react';
import Image from 'next/image';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (avatarUrl: string) => void;
}

export default function AvatarUpload({ currentAvatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes (when mutate() refreshes the data)
  useEffect(() => {
    setAvatarUrl(currentAvatarUrl);
  }, [currentAvatarUrl]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAvatarUrl(data.avatarUrl);
        setPreviewUrl(null);
        if (onUploadSuccess) {
          onUploadSuccess(data.avatarUrl);
        }
      } else {
        setError(data.error || 'Failed to upload avatar');
        setPreviewUrl(null);
      }
    } catch (error) {
      setError('An error occurred while uploading');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploading(true);
    setError('');

    try {
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        setAvatarUrl(null);
        setPreviewUrl(null);
        if (onUploadSuccess) {
          onUploadSuccess('');
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove avatar');
      }
    } catch (error) {
      setError('An error occurred while removing avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const displayUrl = previewUrl || avatarUrl;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt="Profile avatar"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-16 h-16 text-gray-400" />
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-2 rounded-full shadow-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Camera className="w-5 h-5" />
        </button>

        {avatarUrl && !isUploading && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute top-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Click the camera icon to upload a photo
        </p>
        <p className="text-xs text-gray-500 mt-1">
          JPG, PNG, WebP or GIF. Max 5MB.
        </p>
      </div>

      {error && (
        <div className="w-full max-w-xs p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
