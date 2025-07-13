'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Class {
  _id: string;
  className: string;
  section: string;
  batch: string;
  academicYear: string;
  facultyMentor: string;
  studentMentor1: string;
  studentMentor2: string;
  totalStudents: number;
  activeProjects: string[];
  completedProjects: string[];
  sessions: string[];
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

export default function AdminClasses() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024-2025');

  useEffect(() => {
    fetchClasses();
  }, [selectedYear]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/admin/classes?academicYear=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      } else {
        setError('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setError('An error occurred while fetching classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/classes?id=${classId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Class deleted successfully!');
        fetchClasses(); // Refresh the list
      } else {
        setError('Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      setError('An error occurred while deleting class');
    }
  };

  const handleToggleStatus = async (classId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/classes?id=${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setSuccess(`Class ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        fetchClasses(); // Refresh the list
      } else {
        setError('Failed to update class status');
      }
    } catch (error) {
      console.error('Error updating class status:', error);
      setError('An error occurred while updating class status');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Classes</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/classes/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Class
              </Link>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
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

        {/* Filters */}
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

            <div className="ml-auto">
              <span className="text-sm text-gray-600">
                {classes.length} class{classes.length !== 1 ? 'es' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h3>
            <p className="text-gray-600">
              No classes are available for the selected academic year.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {cls.className} - {cls.section}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cls.isActive)}`}>
                    {cls.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Batch:</span>
                    <span>{cls.batch}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Students:</span>
                    <span>{cls.totalStudents}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Faculty Mentor:</span>
                    <span>{cls.facultyMentor}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Student Mentors:</span>
                    <span>{cls.studentMentor1}, {cls.studentMentor2}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Active Projects:</span>
                    <span>{cls.activeProjects.length}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Completed Projects:</span>
                    <span>{cls.completedProjects.length}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Sessions:</span>
                    <span>{cls.sessions.length}</span>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleToggleStatus(cls._id, cls.isActive)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                      cls.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {cls.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls._id)}
                    className="flex-1 px-3 py-2 rounded text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 