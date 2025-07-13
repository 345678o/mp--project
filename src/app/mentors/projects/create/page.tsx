'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Class {
  _id: string;
  className: string;
  section: string;
  batch: string;
  academicYear: string;
}

interface ProblemStatement {
  _id: string;
  title: string;
  description: string;
  domain: string;
  difficulty: string;
}

interface TeamMember {
  name: string;
  rollNumber: string;
  branch: string;
  section: string;
  contact: string;
  email: string;
  graduationYear: string;
}

export default function CreateProject() {
  const router = useRouter();
  const [classId, setClassId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    classId: '',
    academicYear: '2024-2025',
    problemStatementId: '',
    githubLink: '',
    deployedLink: '',
    progressReport: ''
  });

  const [classes, setClasses] = useState<Class[]>([]);
  const [problemStatements, setProblemStatements] = useState<ProblemStatement[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      name: '',
      rollNumber: '',
      branch: '',
      section: '',
      contact: '',
      email: '',
      graduationYear: ''
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressReports, setProgressReports] = useState<{ date: string; text: string }[]>([]);
  const [progressText, setProgressText] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchProblemStatements();
    
    const urlParams = new URLSearchParams(window.location.search);
    const classIdParam = urlParams.get('classId');
    if (!classIdParam) {
      router.replace('/mentors/my-classes');
    } else {
      setClassId(classIdParam);
    }
  }, [router]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/mentors/my-classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchProblemStatements = async () => {
    try {
      const response = await fetch('/api/admin/problems');
      if (response.ok) {
        const data = await response.json();
        setProblemStatements(data.problems || []);
      }
    } catch (error) {
      console.error('Error fetching problem statements:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberChange = (index: number, field: keyof TeamMember, value: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value
    };
    setTeamMembers(updatedMembers);
  };

  const addTeamMember = () => {
    setTeamMembers([
      ...teamMembers,
      {
        name: '',
        rollNumber: '',
        branch: '',
        section: '',
        contact: '',
        email: '',
        graduationYear: ''
      }
    ]);
  };

  const removeTeamMember = (index: number) => {
    if (teamMembers.length > 1) {
      const updatedMembers = teamMembers.filter((_, i) => i !== index);
      setTeamMembers(updatedMembers);
    }
  };

  const handleAddProgressReport = () => {
    if (progressText.trim()) {
      setProgressReports(prev => [...prev, { date: new Date().toISOString(), text: progressText.trim() }]);
      setProgressText('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/mentors/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, teamMembers, progressReport: progressReports }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Project created successfully! Project Code: ${data.projectCode}`);
        // Reset form
        setFormData({
          title: '',
          description: '',
          classId: '',
          academicYear: '2024-2025',
          problemStatementId: '',
          githubLink: '',
          deployedLink: '',
          progressReport: ''
        });
        setTeamMembers([{
          name: '',
          rollNumber: '',
          branch: '',
          section: '',
          contact: '',
          email: '',
          graduationYear: ''
        }]);
      } else {
        setError(data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('An error occurred while creating project');
    } finally {
      setLoading(false);
    }
  };

  if (!classId) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
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

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Problem Statement Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Problem Statement
              </label>
              <select
                name="problemStatementId"
                value={formData.problemStatementId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a problem statement</option>
                {problemStatements.map(ps => (
                  <option key={ps._id} value={ps._id}>
                    {ps.title}
                  </option>
                ))}
              </select>
            </div>
            {/* Progress Reports */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Reports
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={progressText}
                  onChange={e => setProgressText(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a progress update"
                />
                <button type="button" onClick={handleAddProgressReport} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Add</button>
              </div>
              <ul className="list-disc pl-5">
                {progressReports.map((report, idx) => (
                  <li key={idx} className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">{new Date(report.date).toLocaleDateString()}:</span> {report.text}
                  </li>
                ))}
              </ul>
            </div>
            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class *
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
                        {cls.className} {cls.section} - {cls.batch}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="githubLink"
                    value={formData.githubLink}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deployed Link (Optional)
                  </label>
                  <input
                    type="url"
                    name="deployedLink"
                    value={formData.deployedLink}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                <button
                  type="button"
                  onClick={addTeamMember}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors text-sm"
                >
                  Add Member
                </button>
              </div>

              {teamMembers.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">Team Member {index + 1}</h4>
                    {teamMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTeamMember(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll Number *
                      </label>
                      <input
                        type="text"
                        value={member.rollNumber}
                        onChange={(e) => handleTeamMemberChange(index, 'rollNumber', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch *
                      </label>
                      <input
                        type="text"
                        value={member.branch}
                        onChange={(e) => handleTeamMemberChange(index, 'branch', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section *
                      </label>
                      <input
                        type="text"
                        value={member.section}
                        onChange={(e) => handleTeamMemberChange(index, 'section', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        value={member.contact}
                        onChange={(e) => handleTeamMemberChange(index, 'contact', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => handleTeamMemberChange(index, 'email', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year *
                      </label>
                      <input
                        type="text"
                        value={member.graduationYear}
                        onChange={(e) => handleTeamMemberChange(index, 'graduationYear', e.target.value)}
                        placeholder="e.g., 2028"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Report */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress Report
              </label>
              <textarea
                name="progressReport"
                value={formData.progressReport}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the current progress of the project"
              />
            </div>

            {/* Academic Year Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
                <option value="2021-2022">2021-2022</option>
                <option value="2020-2021">2020-2021</option>
                <option value="2019-2020">2019-2020</option>
              </select>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/mentors/dashboard')}
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
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 