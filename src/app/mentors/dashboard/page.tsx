"use client";
import React, { useEffect, useState } from 'react';
import { Session } from '../../../data/session.model';
import { SessionUpdateForm } from '../../../components/SessionUpdateForm';
import { getCurrentMentor } from '../../../data/auth';

const MentorDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    const username = getCurrentMentor();
    if (!username) {
      window.location.href = '/mentors/login';
      return;
    }

    fetchSessions(username);
  }, []);

  const fetchSessions = async (username: string) => {
    try {
      const res = await fetch('/api/mentors/sessions', {
        headers: {
          'x-mentor-username': username
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch sessions');
      }
      
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionUpdate = async (sessionId: string, updates: Partial<Session>) => {
    const username = getCurrentMentor();
    if (!username) {
      window.location.href = '/mentors/login';
      return;
    }

    try {
      const res = await fetch(`/api/mentors/sessions/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-mentor-username': username
        },
        body: JSON.stringify({ sessionId, updates }),
      });

      if (!res.ok) {
        throw new Error('Failed to update session');
      }

      // Refresh sessions
      await fetchSessions(username);
    } catch (error) {
      console.error('Error updating session:', error);
      setError('Failed to update session');
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
    if (activeTab === 'completed') {
      return session.status === 'completed';
    } else {
      return session.status !== 'completed';
    }
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Mentor Dashboard</h2>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg ${
            activeTab === 'upcoming'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Upcoming Sessions
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-lg ${
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
              No {activeTab} sessions found.
            </div>
          )}
          {filteredSessions.map(session => (
            <div 
              key={session._id?.toString()} 
              className="border rounded-lg shadow-sm p-6 space-y-4"
              style={{ borderLeftColor: getSessionStatusColor(session), borderLeftWidth: '4px' }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">
                    {session.className} - {session.section}
                  </h3>
                  <p className="text-gray-600">
                    {session.day}, {session.timeSlot}, {session.slot}
                  </p>
                  <p className="text-gray-600">
                    {new Date(session.date).toLocaleDateString()}
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

              <div className="grid grid-cols-2 gap-4">
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
                <SessionUpdateForm 
                  session={session} 
                  onUpdate={(updates) => handleSessionUpdate(session._id!.toString(), updates)} 
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentorDashboard; 