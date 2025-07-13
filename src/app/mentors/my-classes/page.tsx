'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  mentorRole: 'faculty' | 'student1' | 'student2';
}

interface Project {
  _id: string;
  title: string;
  description: string;
  projectCode: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  teamMembers: {
    name: string;
    rollNumber: string;
    branch: string;
    section: string;
    contact: string;
    email: string;
    graduationYear: string;
  }[];
  createdAt: string;
}

export default function MentorClasses() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [projects, setProjects] = useState<Record<string, Project[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentors/my-classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
        
        // Fetch projects for each class
        const projectsData: Record<string, Project[]> = {};
        for (const cls of data.classes) {
          const projectsResponse = await fetch(`/api/mentors/projects?classId=${cls._id}`);
          if (projectsResponse.ok) {
            const projectsDataResponse = await projectsResponse.json();
            projectsData[cls._id] = projectsDataResponse.projects || [];
          }
        }
        setProjects(projectsData);
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

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'Faculty Mentor';
      case 'student1':
        return 'Student Mentor 1';
      case 'student2':
        return 'Student Mentor 2';
      default:
        return 'Mentor';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'faculty':
        return 'bg-blue-100 text-blue-800';
      case 'student1':
        return 'bg-green-100 text-green-800';
      case 'student2':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Classes</h1>
            <button
              onClick={() => router.push('/mentors/dashboard')}
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

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your classes...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">You are not assigned to any classes yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {classes.map((cls) => (
                <div key={cls._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {cls.className} - {cls.section} (Batch {cls.batch})
                      </h3>
                      <p className="text-gray-600 mb-2">Academic Year: {cls.academicYear}</p>
                      <p className="text-gray-600 mb-2">Total Students: {cls.totalStudents}</p>
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(cls.mentorRole)}`}>
                          {getRoleDisplay(cls.mentorRole)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          cls.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {cls.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/mentors/projects/create?classId=${cls._id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        Add Project
                      </button>
                      <button
                        onClick={() => router.push(`/mentors/projects?classId=${cls._id}`)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        View Projects
                      </button>
                    </div>
                  </div>

                  {/* Projects Summary */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Projects Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-2xl font-bold text-blue-600">
                          {projects[cls._id]?.filter(p => p.status === 'in-progress').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">In Progress</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-2xl font-bold text-green-600">
                          {projects[cls._id]?.filter(p => p.status === 'completed').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">Completed</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-2xl font-bold text-yellow-600">
                          {projects[cls._id]?.filter(p => p.status === 'on-hold').length || 0}
                        </div>
                        <div className="text-sm text-gray-600">On Hold</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Projects */}
                  {projects[cls._id] && projects[cls._id].length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Recent Projects</h4>
                      <div className="space-y-2">
                        {projects[cls._id].slice(0, 3).map((project) => (
                          <div key={project._id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{project.title}</h5>
                                <p className="text-sm text-gray-600">Code: {project.projectCode}</p>
                                <p className="text-sm text-gray-600">Team: {project.teamMembers.length} members</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('-', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {projects[cls._id].length > 3 && (
                          <div className="text-center">
                            <button
                              onClick={() => router.push(`/mentors/projects?classId=${cls._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View all {projects[cls._id].length} projects →
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 