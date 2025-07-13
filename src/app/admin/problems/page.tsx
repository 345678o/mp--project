'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ProblemStatement {
  _id: string;
  title: string;
  description: string;
  domain: string;
  techStacks: string[];
  source: string;
  application?: string;
  resources?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedDuration: string;
  maxTeamSize: number;
  isActive: boolean;
  createdAt: string;
  lastUpdated: string;
  previousImplementations?: {
    title: string;
    year: string;
    status: string;
    teamMembers?: { name: string }[];
    githubLink?: string;
    deployedLink?: string;
  }[];
}

export default function AdminProblems() {
  const router = useRouter();
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedDomain, setSelectedDomain] = useState('all');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch('/api/admin/problems');
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || []);
      } else {
        setError('Failed to fetch problem statements');
      }
    } catch (error) {
      console.error('Error fetching problem statements:', error);
      setError('An error occurred while fetching problem statements');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm('Are you sure you want to delete this problem statement? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/problems?id=${problemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Problem statement deleted successfully!');
        fetchProblems(); // Refresh the list
      } else {
        setError('Failed to delete problem statement');
      }
    } catch (error) {
      console.error('Error deleting problem statement:', error);
      setError('An error occurred while deleting problem statement');
    }
  };

  const handleToggleStatus = async (problemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/problems?id=${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setSuccess(`Problem statement ${currentStatus ? 'deactivated' : 'activated'} successfully!`);
        fetchProblems(); // Refresh the list
      } else {
        setError('Failed to update problem statement status');
      }
    } catch (error) {
      console.error('Error updating problem statement status:', error);
      setError('An error occurred while updating problem statement status');
    }
  };

  const filteredProblems = problems.filter(problem => {
    if (selectedDifficulty !== 'all' && problem.difficulty !== selectedDifficulty) return false;
    if (selectedDomain !== 'all' && problem.domain !== selectedDomain) return false;
    return true;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const domains = Array.from(new Set(problems.map(p => p.domain)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading problem statements...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Manage Problem Statements</h1>
            <div className="flex space-x-4">
              <Link
                href="/admin/problems/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Problem Statement
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
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Domains</option>
                {domains.map(domain => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            <div className="ml-auto">
              <span className="text-sm text-gray-600">
                {filteredProblems.length} problem statement{filteredProblems.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Problem Statements List */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Problem Statements Found</h3>
            <p className="text-gray-600">
              No problem statements are available for the selected criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProblems.map((problem) => (
              <div
                key={problem._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {problem.title}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(problem.isActive)}`}>
                      {problem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {problem.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Domain:</span>
                    <span>{problem.domain}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Duration:</span>
                    <span>{problem.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Team Size:</span>
                    <span>Up to {problem.maxTeamSize} members</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium mr-2">Source:</span>
                    <span>{problem.source}</span>
                  </div>
                  {problem.previousImplementations && problem.previousImplementations.length > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Previous Implementations:</span>
                      <span>{problem.previousImplementations.length}</span>
                    </div>
                  )}
                </div>

                {problem.techStacks.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Technologies:</p>
                    <div className="flex flex-wrap gap-1">
                      {problem.techStacks.slice(0, 3).map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                      {problem.techStacks.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{problem.techStacks.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleToggleStatus(problem._id, problem.isActive)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                      problem.isActive
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {problem.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteProblem(problem._id)}
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