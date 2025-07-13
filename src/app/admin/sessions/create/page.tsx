'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Class {
  _id: string;
  className: string;
  section: string;
  batch: string;
  academicYear: string;
  mentor: string;
  totalStudents: number;
}

interface Mentor {
  _id: string;
  username: string;
  email: string;
  Branch: string;
  Section: string;
}

export default function CreateSession() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    classId: '',
    day: '',
    date: '',
    slot: 'Morning' as 'Morning' | 'Afternoon',
    className: '',
    section: '',
    batch: '',
    academicYear: '2024-2025',
    studentMentor1: '',
    studentMentor2: '',
    facultyMentor: '',
    subMentor: ''
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createMultipleSessions, setCreateMultipleSessions] = useState(false);

  useEffect(() => {
    fetchClasses();
    fetchMentors();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      const selectedClass = classes.find(cls => cls._id === formData.classId);
      if (selectedClass) {
        setFormData(prev => ({
          ...prev,
          className: selectedClass.className,
          section: selectedClass.section,
          batch: selectedClass.batch,
          academicYear: selectedClass.academicYear
        }));
      }
    }
  }, [formData.classId, classes]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/admin/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/admin/mentors');
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate that student mentors are different
    if (formData.studentMentor1 && formData.studentMentor2 && 
        formData.studentMentor1 === formData.studentMentor2) {
      setError('Student mentors cannot be the same');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          createMultipleSessions
        }),
      });

      const data = await response.json();

      if (data.success) {
        const message = createMultipleSessions 
          ? `${data.sessionsCreated || 8} sessions created successfully!`
          : 'Session created successfully!';
        setSuccess(message);
        // Reset form
        setFormData({
          classId: '',
          day: '',
          date: '',
          slot: 'Morning',
          className: '',
          section: '',
          batch: '',
          academicYear: '2024-2025',
          studentMentor1: '',
          studentMentor2: '',
          facultyMentor: '',
          subMentor: ''
        });
        setCreateMultipleSessions(false);
      } else {
        setError(data.message || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      setError('An error occurred while creating session');
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Session</h1>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Class Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Class *
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a class</option>
                    {classes.map(cls => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} - {cls.section} (Batch {cls.batch})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Name (Auto-filled)
                  </label>
                  <input
                    type="text"
                    name="className"
                    value={formData.className}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section (Auto-filled)
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch (Auto-filled)
                  </label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              {/* Session Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Day (Auto-filled)
                  </label>
                  <input
                    type="text"
                    name="day"
                    value={formData.day}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot *
                  </label>
                  <select
                    name="slot"
                    value={formData.slot}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year (Auto-filled)
                  </label>
                  <input
                    type="text"
                    name="academicYear"
                    value={formData.academicYear}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Session Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Session Options</h3>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="createMultipleSessions"
                  checked={createMultipleSessions}
                  onChange={(e) => setCreateMultipleSessions(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="createMultipleSessions" className="ml-2 block text-sm text-gray-900">
                  Create sessions for the next 8 weeks on the same day and time slot
                </label>
              </div>
              
              {createMultipleSessions && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    This will create 8 sessions starting from the selected date, 
                    each on the same day of the week and time slot.
                  </p>
                </div>
              )}
            </div>

            {/* Mentor Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Mentor Assignment</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Mentor 1
                  </label>
                  <select
                    name="studentMentor1"
                    value={formData.studentMentor1}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select student mentor 1</option>
                    {mentors.map(mentor => (
                      <option key={mentor._id} value={mentor.username}>
                        {mentor.username} - {mentor.Branch} {mentor.Section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student Mentor 2
                  </label>
                  <select
                    name="studentMentor2"
                    value={formData.studentMentor2}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select student mentor 2</option>
                    {mentors.map(mentor => (
                      <option key={mentor._id} value={mentor.username}>
                        {mentor.username} - {mentor.Branch} {mentor.Section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Faculty Mentor *
                  </label>
                  <select
                    name="facultyMentor"
                    value={formData.facultyMentor}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select faculty mentor</option>
                    {mentors.map(mentor => (
                      <option key={mentor._id} value={mentor.username}>
                        {mentor.username} - {mentor.Branch} {mentor.Section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Substitute Mentor (Optional)
                  </label>
                  <select
                    name="subMentor"
                    value={formData.subMentor}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select substitute mentor</option>
                    {mentors.map(mentor => (
                      <option key={mentor._id} value={mentor.username}>
                        {mentor.username} - {mentor.Branch} {mentor.Section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2 rounded-md text-white transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 