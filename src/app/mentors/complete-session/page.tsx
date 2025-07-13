'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  _id: string;
  classId: string;
  day: string;
  date: string;
  timeSlot: string;
  slot: 'Morning' | 'Afternoon';
  className: string;
  section: string;
  batch: string;
  studentMentor1: string;
  studentMentor2: string;
  facultyMentor: string;
  subMentor: string;
  sessionProgress: string;
  attendanceImage: string;
  projectStatus: string;
  projects: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'not updated';
  academicYear: string;
  completedBy?: string;
  lastUpdated: string;
  createdAt: string;
}

export default function CompleteSession() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [completionData, setCompletionData] = useState({
    sessionProgress: '',
    projectStatus: '',
    attendanceImage: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      // Extract unique academic years from sessions
      const years = [...new Set(sessions.map(s => s.academicYear))].sort().reverse();
      setAvailableAcademicYears(years);
      
      // Set default to current academic year or first available
      if (years.length > 0 && !selectedAcademicYear) {
        setSelectedAcademicYear(years[0]);
      }
    }
  }, [sessions, selectedAcademicYear]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/mentors/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      } else {
        setError('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('An error occurred while fetching sessions');
    } finally {
      setLoading(false);
    }
  };

  // Filter sessions by academic year and status
  const filteredSessions = sessions.filter(session => {
    // Filter by academic year
    if (selectedAcademicYear && session.academicYear !== selectedAcademicYear) {
      return false;
    }
    
    // Filter out completed sessions
    return session.status !== 'completed';
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCompletionData(prev => ({
          ...prev,
          attendanceImage: data.fileUrl
        }));
      } else {
        setError('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An error occurred while uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (!selectedSession) return;

    if (!completionData.sessionProgress || !completionData.projectStatus || !completionData.attendanceImage) {
      setError('All fields are required to complete the session');
      return;
    }

    try {
      const response = await fetch(`/api/admin/sessions?id=${selectedSession._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...completionData,
          completedBy: 'current_mentor_username' // This should come from session
        }),
      });

      if (response.ok) {
        setSuccess('Session completed successfully!');
        setSelectedSession(null);
        setCompletionData({
          sessionProgress: '',
          projectStatus: '',
          attendanceImage: ''
        });
        fetchSessions(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      setError('An error occurred while completing session');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'not updated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Complete Sessions</h1>
            <button
              onClick={() => router.push('/mentors/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Academic Year Selector */}
        <div className="mb-6">
          <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700 mb-2">
            Select Academic Year
          </label>
          <select
            id="academicYear"
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {availableAcademicYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sessions List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Sessions for {selectedAcademicYear || 'selected academic year'}</h2>
            <div className="space-y-4">
              {filteredSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No pending sessions found for {selectedAcademicYear || 'selected academic year'}.
                </div>
              ) : (
                filteredSessions.map(session => (
                <div
                  key={session._id}
                  className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-colors ${
                    selectedSession?._id === session._id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {session.className} - {session.section} (Batch {session.batch})
                      </h3>
                      <p className="text-gray-600">
                        {formatDate(session.date)} - {session.day}, {session.slot}
                      </p>
                      <p className="text-gray-600">
                        Faculty: {session.facultyMentor}
                      </p>
                      <p className="text-gray-600">
                        Students: {session.studentMentor1}, {session.studentMentor2}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Session Completion Form */}
          {selectedSession && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Complete Session: {selectedSession.className} - {selectedSession.section}
              </h2>
              <p className="text-gray-600 mb-4">
                {formatDate(selectedSession.date)} - {selectedSession.day}, {selectedSession.slot}
              </p>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Progress *
                  </label>
                  <textarea
                    value={completionData.sessionProgress}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, sessionProgress: e.target.value }))}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what was done in this session..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Status *
                  </label>
                  <textarea
                    value={completionData.projectStatus}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, projectStatus: e.target.value }))}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the current status of projects..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                  {completionData.attendanceImage && (
                    <p className="text-sm text-green-600 mt-1">✓ Image uploaded successfully</p>
                  )}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSession(null);
                      setCompletionData({
                        sessionProgress: '',
                        projectStatus: '',
                        attendanceImage: ''
                      });
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteSession}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Complete Session
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 