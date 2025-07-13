'use client';

import React, { useEffect, useState } from 'react';
import { Session } from '../../../data/session.model';
import { useRouter } from 'next/navigation';

const MentorDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [availableAcademicYears, setAvailableAcademicYears] = useState<string[]>([]);
  const [mentorStats, setMentorStats] = useState({
    overallSessions: 0,
    currentYearSessions: 0,
    completedSessions: 0,
    pendingSessions: 0
  });
  const [completingSession, setCompletingSession] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState({
    sessionProgress: '',
    projectStatus: '',
    attendanceImage: ''
  });
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

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
      const res = await fetch('/api/mentors/sessions');
      
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/mentors/login');
          return;
        }
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await res.json();
      setSessions(data.sessions || []);
      
      // Calculate session statistics
      const completedSessions = data.sessions?.filter((s: Session) => s.status === 'completed').length || 0;
      const pendingSessions = data.sessions?.filter((s: Session) => s.status !== 'completed').length || 0;
      
      setMentorStats({
        overallSessions: data.mentorStats?.sessions_taken_overall || 0,
        currentYearSessions: data.mentorStats?.current_sem_sessions_taken || 0,
        completedSessions,
        pendingSessions
      });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for selected academic year
  const getStatsForYear = (academicYear: string) => {
    const yearSessions = sessions.filter(s => s.academicYear === academicYear);
    const completedThisYear = yearSessions.filter(s => s.status === 'completed').length;
    const pendingThisYear = yearSessions.filter(s => s.status !== 'completed').length;
    
    return {
      completed: completedThisYear,
      pending: pendingThisYear,
      total: yearSessions.length
    };
  };

  const currentYearStats = selectedAcademicYear ? getStatsForYear(selectedAcademicYear) : { completed: 0, pending: 0, total: 0 };

  const handleSessionUpdate = async (sessionId: string, updates: Partial<Session>) => {
    try {
      const res = await fetch(`/api/mentors/sessions/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, updates }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/mentors/login');
          return;
        }
        throw new Error('Failed to update session');
      }

      // Refresh sessions
      await fetchSessions();
    } catch (error) {
      console.error('Error updating session:', error);
      setError('Failed to update session');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Convert file to base64 for storage
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      setCompletionData(prev => ({
        ...prev,
        attendanceImage: base64Image
      }));
    } catch (error) {
      console.error('Error processing file:', error);
      setError('An error occurred while processing the image');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    if (!completionData.sessionProgress || !completionData.projectStatus || !completionData.attendanceImage) {
      setError('All fields are required to complete the session');
      return;
    }

    try {
      // Get the current session to find the mentor username
      const currentSession = sessions.find(s => s._id?.toString() === sessionId);
      if (!currentSession) {
        setError('Session not found');
        return;
      }

      // Determine which mentor is completing the session
      let completedBy = '';
      if (currentSession.studentMentor1) {
        completedBy = currentSession.studentMentor1;
      } else if (currentSession.studentMentor2) {
        completedBy = currentSession.studentMentor2;
      } else if (currentSession.facultyMentor) {
        completedBy = currentSession.facultyMentor;
      } else if (currentSession.subMentor) {
        completedBy = currentSession.subMentor;
      }

      const requestBody = {
        ...completionData,
        completedBy: completedBy
      };

      console.log('Sending session completion request:', {
        sessionId,
        completedBy,
        hasSessionProgress: !!completionData.sessionProgress,
        hasProjectStatus: !!completionData.projectStatus,
        hasAttendanceImage: !!completionData.attendanceImage
      });

      const response = await fetch(`/api/admin/sessions?id=${sessionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        setCompletingSession(null);
        setCompletionData({
          sessionProgress: '',
          projectStatus: '',
          attendanceImage: ''
        });
        await fetchSessions(); // Refresh the list
        setError(null);
      } else {
        const data = await response.json();
        console.error('Session completion failed:', data);
        setError(data.message || 'Failed to complete session');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      setError('An error occurred while completing session');
    }
  };

  const getSessionStatusColor = (session: Session) => {
    const status = session.status || 'pending';
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in-progress':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  };

  const getSessionStatusDisplay = (session: Session) => {
    const status = session.status || 'pending';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredSessions = sessions.filter(session => {
    // First filter by academic year
    if (selectedAcademicYear && session.academicYear !== selectedAcademicYear) {
      return false;
    }
    
    // Then filter by status
    if (activeTab === 'completed') {
      return session.status === 'completed';
    } else {
      return session.status !== 'completed';
    }
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/mentors/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mentor Dashboard</h1>
                <p className="text-sm text-gray-600">Management System</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Session Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">{mentorStats.overallSessions}</div>
                <div className="text-gray-600 text-sm">Overall Sessions</div>
                <div className="text-xs text-gray-500">All time completed</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{currentYearStats.completed}</div>
                <div className="text-gray-600 text-sm">This Year</div>
                <div className="text-xs text-gray-500">{selectedAcademicYear} completed</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">{currentYearStats.pending}</div>
                <div className="text-gray-600 text-sm">Pending</div>
                <div className="text-xs text-gray-500">{selectedAcademicYear} pending</div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⏳</span>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">{currentYearStats.total}</div>
                <div className="text-gray-600 text-sm">Total Sessions</div>
                <div className="text-xs text-gray-500">{selectedAcademicYear} total</div>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 text-xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all duration-200 cursor-pointer group" onClick={() => router.push('/mentors/my-classes')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-green-600 text-xl">🏫</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">My Classes</h3>
              <p className="text-gray-600 text-sm">View your assigned classes</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer group" onClick={() => router.push('/mentors/projects')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-blue-600 text-xl">📁</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">My Projects</h3>
              <p className="text-gray-600 text-sm">View and manage your projects</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-purple-300 transition-all duration-200 cursor-pointer group" onClick={() => router.push('/mentors/projects/create')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-purple-600 text-xl">➕</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Create Project</h3>
              <p className="text-gray-600 text-sm">Add a new project for your class</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-orange-300 transition-all duration-200 cursor-pointer group" onClick={() => router.push('/mentors/complete-session')}>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <span className="text-orange-600 text-xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Complete Sessions</h3>
              <p className="text-gray-600 text-sm">Mark sessions as completed</p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming Sessions
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'completed'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed Sessions
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No {activeTab} sessions found for {selectedAcademicYear || 'selected academic year'}.
              </div>
            )}
            {filteredSessions.map(session => (
                          <div 
              key={session._id?.toString()} 
              className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 hover:shadow-md transition-all duration-200"
              style={{ borderLeftColor: getSessionStatusColor(session), borderLeftWidth: '4px' }}
            >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {session.className} - {session.section} (Batch {session.batch})
                    </h3>
                    <p className="text-gray-600">
                      {session.day}, {session.timeSlot}, {session.slot}
                    </p>
                    <p className="text-gray-600">
                      {new Date(session.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      Academic Year: {session.academicYear}
                    </p>
                  </div>
                  <div className="text-right">
                    <span 
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        (session.status || 'pending') === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : (session.status || 'pending') === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getSessionStatusDisplay(session)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-semibold">Student Mentor 1:</span> {session.studentMentor1 || 'Not assigned'}</p>
                    <p><span className="font-semibold">Student Mentor 2:</span> {session.studentMentor2 || 'Not assigned'}</p>
                    <p><span className="font-semibold">Faculty Mentor:</span> {session.facultyMentor}</p>
                  </div>
                  <div>
                    <p>
                      <span className="font-semibold">Sub-Mentor:</span> 
                      {session.subMentor || 'None'}
                    </p>
                    <p>
                      <span className="font-semibold">Substituted Mentor 1:</span>
                      {session.substitutedMentor1 
                        ? `${session.substitutedMentor1.substituteMentor} (for ${session.substitutedMentor1.originalMentor})`
                        : 'None'}
                    </p>
                    <p>
                      <span className="font-semibold">Substituted Mentor 2:</span>
                      {session.substitutedMentor2
                        ? `${session.substitutedMentor2.substituteMentor} (for ${session.substitutedMentor2.originalMentor})`
                        : 'None'}
                    </p>
                  </div>
                </div>

                {session.sessionProgress && (
                  <div className="mt-4">
                    <p className="font-semibold">Progress:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{session.sessionProgress}</p>
                  </div>
                )}

                {session.attendanceImage && (
                  <div className="mt-4">
                    <p className="font-semibold mb-2">Attendance:</p>
                    <img 
                      src={session.attendanceImage} 
                      alt="Attendance" 
                      className="max-w-md rounded shadow-sm" 
                    />
                  </div>
                )}

                {activeTab === 'upcoming' && session.status !== 'completed' && (
                  <div className="mt-4 space-y-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSessionUpdate(session._id!.toString(), { status: 'in-progress' })}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      >
                        Start Session
                      </button>
                      <button
                        onClick={() => setCompletingSession(session._id!.toString())}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                      >
                        Complete Session
                      </button>
                    </div>
                    
                    {/* Session Completion Form */}
                    {completingSession === session._id?.toString() && (
                      <div className="border-t pt-4 bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl">
                        <h4 className="font-semibold text-gray-900 mb-3">Complete Session</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Session Progress *
                            </label>
                            <textarea
                              value={completionData.sessionProgress}
                              onChange={(e) => setCompletionData(prev => ({ ...prev, sessionProgress: e.target.value }))}
                              rows={3}
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
                              rows={2}
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
                                                         {uploading && <p className="text-sm text-blue-600 mt-1">Processing image...</p>}
                             {completionData.attendanceImage && (
                               <p className="text-sm text-green-600 mt-1">✓ Image processed successfully</p>
                             )}
                          </div>

                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => {
                                setCompletingSession(null);
                                setCompletionData({
                                  sessionProgress: '',
                                  projectStatus: '',
                                  attendanceImage: ''
                                });
                              }}
                              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleCompleteSession(session._id!.toString())}
                              disabled={!completionData.sessionProgress || !completionData.projectStatus || !completionData.attendanceImage}
                              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Complete Session
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorDashboard; 