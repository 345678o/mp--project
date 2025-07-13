'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  _id: string;
  title: string;
  description: string;
  projectCode: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  academicYear: string;
  teamMembers: {
    name: string;
    rollNumber: string;
    branch: string;
    section: string;
    contact: string;
    email: string;
    graduationYear: string;
  }[];
  githubLink?: string;
  deployedLink?: string;
  createdAt: string;
}

export default function PublicProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [selectedYear, selectedStatus]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedYear) {
        params.append('academicYear', selectedYear);
      }
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`/api/public/projects?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      } else {
        setError('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('An error occurred while fetching projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group projects by academic year
  const projectsByYear = projects.reduce((acc, project) => {
    const year = project.academicYear;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(project);
    return acc;
  }, {} as Record<string, Project[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Public Projects</h1>
                <p className="text-sm text-gray-600">Browse completed and ongoing projects</p>
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
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="">All Status</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchProjects}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {Object.keys(projectsByYear).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-orange-600 text-4xl">📁</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              No projects found matching the selected criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(projectsByYear).map(([year, yearProjects]) => (
              <div key={year} className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-lg">📅</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Academic Year: {year}
                  </h2>
                  <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                    {yearProjects.length} project{yearProjects.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearProjects.map((project) => (
                    <div 
                      key={project._id} 
                      className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                            {project.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                            {project.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="bg-gray-100 px-2 py-1 rounded-full">Code: {project.projectCode}</span>
                            <span className="bg-gray-100 px-2 py-1 rounded-full">Team: {project.teamMembers.length}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>

                      {/* Team Members (limited view) */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 text-sm mb-2">Team Members</h4>
                        <div className="space-y-1">
                          {project.teamMembers.slice(0, 3).map((member, index) => (
                            <div key={index} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                              {member.name} - {member.branch} {member.section}
                            </div>
                          ))}
                          {project.teamMembers.length > 3 && (
                            <div className="text-xs text-gray-500 bg-orange-50 px-2 py-1 rounded">
                              +{project.teamMembers.length - 3} more members
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Links */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-200">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-center"
                          >
                            GitHub
                          </a>
                        )}
                        {project.deployedLink && (
                          <a
                            href={project.deployedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-orange-100 text-orange-700 text-xs px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors text-center"
                          >
                            Live Demo
                          </a>
                        )}
                      </div>

                      <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
                        Created: {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 