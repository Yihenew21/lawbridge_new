'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Loader2, AlertCircle } from 'lucide-react';

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const email = searchParams.get('email');

  const [code, setCode] = useState('');
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId) {
      setError('Invalid verification request');
      return;
    }

    if (!code) {
      setError('Please enter a verification code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/2fa/verify-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code: code.trim(),
          isBackupCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to appropriate dashboard based on user role
        const user = data.user;
        if (user.role === 'lawyer') {
          router.push('/dashboard/lawyer');
        } else if (user.role === 'student') {
          router.push('/assistant');
        } else {
          router.push('/dashboard/client');
        }
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!userId || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Request</h1>
          <p className="text-gray-600 mb-6">This 2FA verification link is invalid.</p>
          <Link
            href="/auth/login"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h1>
          <p className="text-gray-600">
            Enter the verification code from your authenticator app
          </p>
          <p className="text-sm text-gray-500 mt-2">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              {isBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-center text-2xl tracking-widest text-gray-900"
              placeholder={isBackupCode ? 'XXXX-XXXX' : '000000'}
              maxLength={isBackupCode ? 9 : 6}
              required
              autoComplete="off"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsBackupCode(!isBackupCode);
                setCode('');
                setError('');
              }}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              {isBackupCode ? 'Use authenticator code' : 'Use backup code'}
            </button>
          </div>

          <div className="text-center pt-4 border-t">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-700">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    }>
      <Verify2FAForm />
    </Suspense>
  );
}
