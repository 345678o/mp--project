'use client';

import { useState, useEffect } from 'react';
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

export default function ProblemStatements() {
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch(`/api/admin/problems?isActive=true`);
      if (response.ok) {
        const data = await response.json();
        setProblems(data.problems || []);
      } else {
        setError('Failed to fetch problem statements');
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError('An error occurred while fetching problem statements');
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter(problem => {
    if (selectedDifficulty === 'all') return true;
    return problem.difficulty === selectedDifficulty;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading problem statements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Problem Statements</h1>
                <p className="text-sm text-gray-600">Browse available project problems</p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div className="ml-auto">
              <span className="text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                {filteredProblems.length} problem statement{filteredProblems.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Problem Statements Grid */}
        {filteredProblems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-purple-600 text-4xl">📋</span>
            </div>
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
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {problem.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
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
                  {problem.application && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Application:</span>
                      <span>{problem.application}</span>
                    </div>
                  )}
                  {problem.resources && (
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium mr-2">Resources:</span>
                      <span>{problem.resources}</span>
                    </div>
                  )}
                </div>

                {problem.techStacks.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Technologies:</p>
                    <div className="flex flex-wrap gap-1">
                      {problem.techStacks.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {problem.previousImplementations && problem.previousImplementations.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Previous Implementations:</p>
                    <div className="space-y-2">
                      {problem.previousImplementations.map((impl, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{impl.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              impl.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {impl.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">Year: {impl.year}</p>
                          {impl.teamMembers && (
                            <p className="text-xs text-gray-500 mb-2">
                              Team: {impl.teamMembers.map(m => m.name).join(', ')}
                            </p>
                          )}
                          <div className="flex space-x-2">
                            {impl.githubLink && (
                              <a
                                href={impl.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                GitHub
                              </a>
                            )}
                            {impl.deployedLink && (
                              <a
                                href={impl.deployedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-green-600 hover:text-green-800"
                              >
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
                  Created: {new Date(problem.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 