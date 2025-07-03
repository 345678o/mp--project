'use client';

import React, { useState } from 'react';

interface AdminCredentials {
  username: string;
  password: string;
  email: string;
}

export default function TempTest() {
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateAdmin = async () => {
    setLoading(true);
    setError(null);
    setCredentials(null);

    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate admin credentials');
      }

      const data = await res.json();
      setCredentials(data.credentials);
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Temporary Admin Generator</h1>
      
      <div className="space-y-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-700">
            <strong>Warning:</strong> This page is for temporary testing only. 
            Generated credentials will have full admin access.
          </p>
        </div>

        <button
          onClick={handleGenerateAdmin}
          disabled={loading}
          className={`w-full py-2 px-4 rounded ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'Generating...' : 'Generate Admin Credentials'}
        </button>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {credentials && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <h2 className="text-lg font-semibold mb-4">Generated Credentials:</h2>
            <div className="space-y-2 font-mono">
              <p><strong>Username:</strong> {credentials.username}</p>
              <p><strong>Password:</strong> {credentials.password}</p>
              <p><strong>Email:</strong> {credentials.email}</p>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Make sure to save these credentials. You won&apos;t be able to see them again.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 