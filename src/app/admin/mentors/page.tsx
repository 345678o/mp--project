'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Mentor {
  _id: string;
  username: string;
  email: string;
  Branch: string;
  Section: string;
  role: 'student' | 'faculty';
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
}

export default function AdminMentors() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('/api/admin/mentors');
      if (response.ok) {
        const data = await response.json();
        setMentors(data.mentors || []);
      } else {
        setError('Failed to fetch mentors');
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
      setError('An error occurred while fetching mentors');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMentor = async (mentorId: string) => {
    if (!confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/mentors?id=${mentorId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Mentor deleted successfully!');
        fetchMentors(); // Refresh the list
      } else {
        setError('Failed to delete mentor');
      }
    } catch (error) {
      console.error('Error deleting mentor:', error);
      setError('An error occurred while deleting mentor');
    }
  };

  const handleToggleStatus = async (mentorId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/mentors?id=${mentorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setSuccess(`Mentor ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        fetchMentors(); // Refresh the list
      } else {
        setError('Failed to update mentor status');
      }
    } catch (error) {
      console.error('Error updating mentor status:', error);
      setError('An error occurred while updating mentor status');
    }
  };

  const filteredMentors = mentors.filter(mentor => {
    if (selectedRole === 'all') return true;
    return mentor.role === selectedRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'bg-purple-100 text-purple-800';
      case 'student':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading mentors...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Mentors</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/mentors/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Mentor
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
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="student">Student Mentors</option>
                <option value="faculty">Faculty Mentors</option>
              </select>
            </div>

            <div className="ml-auto">
              <span className="text-sm text-gray-600">
                {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Mentors List */}
        {filteredMentors.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Mentors Found</h3>
            <p className="text-gray-600">
              No mentors are available for the selected criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mentor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMentors.map((mentor) => (
                  <tr key={mentor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {mentor.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {mentor.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {mentor.Branch} {mentor.Section}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{mentor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(mentor.role)}`}>
                        {mentor.role === 'faculty' ? 'Faculty' : 'Student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mentor.isActive)}`}>
                        {mentor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(mentor._id, mentor.isActive)}
                          className={`px-3 py-1 rounded text-xs ${
                            mentor.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {mentor.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteMentor(mentor._id)}
                          className="px-3 py-1 rounded text-xs bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 