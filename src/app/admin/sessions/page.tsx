'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

export default function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYearForCalendar, setSelectedYearForCalendar] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchSessions();
  }, [selectedYear]);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`/api/admin/sessions?academicYear=${selectedYear}`);
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

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sessions?id=${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Session deleted successfully!');
        fetchSessions(); // Refresh the list
      } else {
        setError('Failed to delete session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      setError('An error occurred while deleting session');
    }
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate.getDate() === date.getDate() &&
             sessionDate.getMonth() === date.getMonth() &&
             sessionDate.getFullYear() === date.getFullYear();
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYearForCalendar);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYearForCalendar);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const calendar = [];
    let dayCount = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay) {
          week.push(<div key={`empty-${j}`} className="p-2"></div>);
        } else if (dayCount > daysInMonth) {
          week.push(<div key={`empty-end-${j}`} className="p-2"></div>);
        } else {
          const currentDate = new Date(selectedYearForCalendar, selectedMonth, dayCount);
          const daySessions = getSessionsForDate(currentDate);
          
          week.push(
            <div key={dayCount} className="p-2 border min-h-[100px]">
              <div className="text-sm font-medium mb-1">{dayCount}</div>
              {daySessions.map(session => (
                <div
                  key={session._id}
                  className={`text-xs p-1 mb-1 rounded cursor-pointer ${getStatusColor(session.status)} relative group`}
                  title={`${session.className} ${session.section} - ${session.slot}`}
                >
                  <div className="flex justify-between items-center">
                    <span>{session.className} {session.section}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-800 ml-1"
                      title="Delete Session"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
          dayCount++;
        }
      }
      calendar.push(<div key={i} className="grid grid-cols-7">{week}</div>);
    }

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {monthNames[selectedMonth]} {selectedYearForCalendar}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYearForCalendar(selectedYearForCalendar - 1);
                } else {
                  setSelectedMonth(selectedMonth - 1);
                }
              }}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYearForCalendar(selectedYearForCalendar + 1);
                } else {
                  setSelectedMonth(selectedMonth + 1);
                }
              }}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-sm">
              {day}
            </div>
          ))}
        </div>
        
        {calendar}
      </div>
    );
  };

  const renderList = () => {
    return (
      <div className="space-y-4">
        {sessions.map(session => (
          <div
            key={session._id}
            className="bg-white rounded-lg shadow p-6"
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
                  Faculty Mentor: {session.facultyMentor}
                </p>
                <p className="text-gray-600">
                  Student Mentors: {session.studentMentor1}, {session.studentMentor2}
                </p>
                {session.completedBy && (
                  <p className="text-green-600">
                    Completed by: {session.completedBy}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                  {session.status}
                </span>
                <button
                  onClick={() => handleDeleteSession(session._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="Delete Session"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Sessions</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/sessions/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Session
              </Link>
              <Link
                href="/admin/dashboard"
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'calendar' | 'list')}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="calendar">Calendar View</option>
                <option value="list">List View</option>
              </select>
            </div>

            <div className="ml-auto">
              <span className="text-sm text-gray-600">
                {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-600">
              No sessions are available for the selected criteria.
            </p>
          </div>
        ) : (
          viewMode === 'calendar' ? renderCalendar() : renderList()
        )}
      </div>
    </div>
  );
} 