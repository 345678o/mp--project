"use client";
import React, { useEffect, useState } from 'react';
import { Session, SessionStatus } from '../../../data/session.model';
import { ProblemStatement } from '@/data/problem.model';
import { SessionUpdateForm } from '../../../components/SessionUpdateForm';
import { getAdminEmail } from '../../../data/auth';
import { useRouter } from 'next/navigation';

interface ProblemFormData {
  title: string;
  description: string;
  domain: string;
  techStacks: string[];
  source: string;
}

const AdminDashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'create-mentor' | 'create-session' | 'problem-statements'>('upcoming');
  const [allMentors, setAllMentors] = useState<{username: string, email: string}[]>([]);
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Mentor form data
    username: '',
    password: '',
    email: '',
    Branch: '',
    Section: '',
    CIE_Department: '',
    GraduationYear: '',
    CurrentYear: '',
    // Session form data
    className: '',
    section: '',
    day: '',
    timeSlot: '',
    date: '',
    studentMentor1: '',
    studentMentor2: '',
    facultyMentor: '',
    subMentor: '',
  });

  // State for Problem Statements
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [problemFormData, setProblemFormData] = useState<ProblemFormData>({
    title: '',
    description: '',
    domain: '',
    techStacks: [],
    source: ''
  });
  const [techStackInput, setTechStackInput] = useState('');

  useEffect(() => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      router.push('/mentors/login');
      return;
    }

    if (activeTab === 'upcoming' || activeTab === 'completed') {
      setLoading(true);
      fetchSessions(adminEmail);
    }

    if (activeTab === 'create-session') {
      setLoading(true);
      fetchAllMentors(adminEmail);
    }
    if (activeTab === 'problem-statements') {
      setLoading(true);
      fetchProblems();
    }
  }, [router, activeTab]);

  const fetchSessions = async (adminEmail: string) => {
    try {
      const res = await fetch('/api/admin/sessions', {
        headers: {
          'x-admin-email': adminEmail
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

  const fetchAllMentors = async (adminEmail: string) => {
    try {
      const res = await fetch('/api/mentors/all', {
        headers: {
          'x-admin-email': adminEmail
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch mentors');
      }
      
      const data = await res.json();
      setAllMentors(data.mentors || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('Failed to load mentors');
    }
  };

  const fetchProblems = async () => {
    setError(null);
    try {
      const res = await fetch('/api/admin/problems');
      
      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems || []);
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to fetch problems');
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('An error occurred while fetching problems');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionUpdate = async (sessionId: string, updates: Partial<Session>) => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      router.push('/mentors/login');
      return;
    }

    try {
      const res = await fetch(`/api/admin/sessions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ sessionId, updates }),
      });

      if (!res.ok) {
        throw new Error('Failed to update session');
      }

      await fetchSessions(adminEmail);
    } catch (error) {
      console.error('Error updating session:', error);
      setError('Failed to update session');
    }
  };

  const handleAutoPopulate = async (session: Session) => {
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      router.push('/mentors/login');
      return;
    }

    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify({ 
          ...session, 
          date: new Date(new Date(session.date).getTime() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending' as SessionStatus,
          attendanceImage: undefined,
          sessionProgress: undefined,
          completedAt: undefined,
          substitutedMentor1: undefined,
          substitutedMentor2: undefined
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to auto-populate session');
      }

      await fetchSessions(adminEmail);
    } catch (error) {
      console.error('Error auto-populating session:', error);
      setError('Failed to auto-populate session');
    }
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      router.push('/mentors/login');
      return;
    }

    try {
      const mentorData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        Branch: formData.Branch,
        Section: formData.Section,
        CIE_Department: formData.CIE_Department,
        GraduationYear: formData.GraduationYear,
        CurrentYear: formData.CurrentYear,
      };

      const res = await fetch('/api/admin/mentors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(mentorData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create mentor');
      }

      // Reset form and show success message
      setFormData(prev => ({
        ...prev,
        username: '',
        password: '',
        email: '',
        Branch: '',
        Section: '',
        CIE_Department: '',
        GraduationYear: '',
        CurrentYear: '',
      }));
      setError('Mentor created successfully!');
    } catch (error) {
      console.error('Error creating mentor:', error);
      setError(error instanceof Error ? error.message : 'Failed to create mentor');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      router.push('/mentors/login');
      return;
    }

    try {
      const sessionData = {
        className: formData.className,
        section: formData.section,
        day: formData.day,
        timeSlot: formData.timeSlot,
        slot: formData.timeSlot,
        date: new Date(formData.date).toISOString(),
        studentMentor1: formData.studentMentor1,
        studentMentor2: formData.studentMentor2,
        facultyMentor: formData.facultyMentor,
        subMentor: formData.subMentor,
        status: 'pending' as SessionStatus,
      };

      const res = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(sessionData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create session');
      }

      // Reset form and show success message
      setFormData(prev => ({
        ...prev,
        className: '',
        section: '',
        day: '',
        timeSlot: '',
        date: '',
        studentMentor1: '',
        studentMentor2: '',
        facultyMentor: '',
        subMentor: '',
      }));
      setError('Session created successfully!');
      
      // Refresh sessions list if we're viewing them
      if (activeTab === 'upcoming' || activeTab === 'completed') {
        await fetchSessions(adminEmail);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError(error instanceof Error ? error.message : 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'date') {
      // Automatically set the day based on the selected date
      const selectedDate = new Date(value);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = days[selectedDate.getDay()];
      
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        day: dayOfWeek
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    } else if (activeTab === 'upcoming') {
      return session.status !== 'completed';
    }
    return false;
  });

  const renderTabs = () => (
    <div className="mb-6 flex space-x-1 border-b">
      <button onClick={() => setActiveTab('upcoming')} className={`py-2 px-4 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Upcoming Sessions</button>
      <button onClick={() => setActiveTab('completed')} className={`py-2 px-4 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Completed Sessions</button>
      <button onClick={() => setActiveTab('create-mentor')} className={`py-2 px-4 ${activeTab === 'create-mentor' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Create Mentor</button>
      <button onClick={() => setActiveTab('create-session')} className={`py-2 px-4 ${activeTab === 'create-session' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Create Session</button>
      <button onClick={() => setActiveTab('problem-statements')} className={`py-2 px-4 ${activeTab === 'problem-statements' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Problem Statements</button> 
    </div>
  );

  const renderCreateMentorForm = () => (
    <form onSubmit={handleCreateMentor} className="space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Branch</label>
        <input
          type="text"
          name="Branch"
          value={formData.Branch}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Section</label>
        <input
          type="text"
          name="Section"
          value={formData.Section}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">CIE Department</label>
        <input
          type="text"
          name="CIE_Department"
          value={formData.CIE_Department}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Graduation Year</label>
        <input
          type="text"
          name="GraduationYear"
          value={formData.GraduationYear}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Current Year</label>
        <input
          type="text"
          name="CurrentYear"
          value={formData.CurrentYear}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white transition-colors`}
      >
        {loading ? 'Creating...' : 'Create Mentor'}
      </button>
    </form>
  );

  const renderCreateSessionForm = () => (
    <form onSubmit={handleCreateSession} className="space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Class Name</label>
        <input
          type="text"
          name="className"
          value={formData.className}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Section</label>
        <input
          type="text"
          name="section"
          value={formData.section}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Day (Auto-generated)</label>
        <input
          type="text"
          name="day"
          value={formData.day}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Time Slot</label>
        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Time Slot</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Student Mentor 1</label>
        <select
          name="studentMentor1"
          value={formData.studentMentor1}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Student Mentor 1</option>
          {allMentors.map(mentor => (
            <option key={mentor.username} value={mentor.username}>{mentor.username}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Student Mentor 2</label>
        <select
          name="studentMentor2"
          value={formData.studentMentor2}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Student Mentor 2</option>
          {allMentors.map(mentor => (
            <option key={mentor.username} value={mentor.username}>{mentor.username}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Faculty Mentor</label>
        <select
          name="facultyMentor"
          value={formData.facultyMentor}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Select Faculty Mentor</option>
          {allMentors.map(mentor => (
            <option key={mentor.username} value={mentor.username}>{mentor.username}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Sub Mentor (Optional)</label>
        <select
          name="subMentor"
          value={formData.subMentor}
          onChange={handleChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Sub Mentor</option>
          {allMentors.map(mentor => (
            <option key={mentor.username} value={mentor.username}>{mentor.username}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white transition-colors`}
      >
        {loading ? 'Creating...' : 'Create Session'}
      </button>
    </form>
  );

  const renderSessionsList = () => (
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
                {session.day}, {session.timeSlot}
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

          {activeTab === 'completed' && (
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => handleAutoPopulate(session)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Auto-populate Next Week
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // New function to render Problem Statements Tab
  const renderProblemStatementsTab = () => (
    <div>
      <h2 className="text-xl font-semibold mb-4">Problem Statements Management</h2>
      
      {/* Create Problem Statement Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-lg font-semibold mb-4">Create New Problem Statement</h3>
        <form onSubmit={handleCreateProblemSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={problemFormData.title}
              onChange={handleProblemInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={problemFormData.description}
              onChange={handleProblemInputChange}
              className="w-full p-2 border rounded h-24 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Domain</label>
            <input
              type="text"
              name="domain"
              value={problemFormData.domain}
              onChange={handleProblemInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tech Stacks (Press Enter to add)</label>
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyDown={handleTechStackKeyDown}
              placeholder="e.g., React, Node.js"
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {problemFormData.techStacks.map((tech, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechStack(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Source</label>
            <input
              type="text"
              name="source"
              value={problemFormData.source}
              onChange={handleProblemInputChange}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Problem Statement'}
          </button>
        </form>
      </div>

      {/* List of Problem Statements */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Existing Problem Statements</h3>
        {problems.length === 0 && !loading && <p>No problem statements found.</p>}
        <div className="space-y-4">
          {problems.map((problem) => (
            <div key={problem._id?.toString()} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-md">{problem.title}</h4>
                <button
                  onClick={() => problem._id && handleDeleteProblem(problem._id.toString())}
                  className="text-red-500 hover:text-red-700 text-sm"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1 mb-2 break-words">{problem.description}</p>
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Domain:</span> {problem.domain}</p>
                <p><span className="font-medium">Source:</span> {problem.source}</p>
                <div>
                  <span className="font-medium">Tech Stacks:</span>
                  {problem.techStacks.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {problem.techStacks.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : ( <span className="text-gray-500"> None specified</span> )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleProblemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProblemFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechStackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techStackInput.trim()) {
      e.preventDefault();
      setProblemFormData(prev => ({
        ...prev,
        techStacks: [...prev.techStacks, techStackInput.trim()]
      }));
      setTechStackInput('');
    }
  };

  const removeTechStack = (index: number) => {
    setProblemFormData(prev => ({
      ...prev,
      techStacks: prev.techStacks.filter((_, i) => i !== index)
    }));
  };

  const handleCreateProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      setError("Admin authentication required.");
      setLoading(false);
      router.push('/mentors/login');
      return;
    }

    try {
      const res = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail
        },
        body: JSON.stringify(problemFormData)
      });

      if (res.ok) {
        setSuccess('Problem statement created successfully!');
        setProblemFormData({
          title: '',
          description: '',
          domain: '',
          techStacks: [],
          source: ''
        });
        fetchProblems();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to create problem statement');
      }
    } catch (err) {
      console.error('Error creating problem statement:', err);
      setError('An error occurred while creating problem statement.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteProblem = async (problemId: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      setError("Admin authentication required.");
      setLoading(false);
      router.push('/mentors/login');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this problem statement?")) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/problems?problemId=${problemId}`, {
        method: 'DELETE',
        headers: {
          'x-admin-email': adminEmail
        },
      });

      if (res.ok) {
        setSuccess('Problem statement deleted successfully!');
        fetchProblems();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to delete problem statement');
      }
    } catch (err) {
      console.error('Error deleting problem statement:', err);
      setError('An error occurred while deleting problem statement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
      
      {renderTabs()}

      {loading && activeTab !== 'problem-statements' && <p className="text-center">Loading sessions...</p>}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">{error}</div>}
      {success && activeTab === 'problem-statements' && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">{success}</div>}

      {activeTab === 'upcoming' && renderSessionsList()}
      {activeTab === 'completed' && renderSessionsList()}
      {activeTab === 'create-mentor' && renderCreateMentorForm()}
      {activeTab === 'create-session' && renderCreateSessionForm()}
      {activeTab === 'problem-statements' && renderProblemStatementsTab()}
    </div>
  );
};

export default AdminDashboard; 