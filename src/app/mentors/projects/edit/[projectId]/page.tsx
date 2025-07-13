"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, FileText, Code, Users, Plus } from "lucide-react"

interface Project {
  _id: string
  title: string
  description: string
  projectCode: string
  status: "in-progress" | "completed" | "on-hold"
  academicYear: string
  teamMembers: {
    name: string
    rollNumber: string
    branch: string
    section: string
    contact: string
    email: string
    graduationYear: string
  }[]
  githubLink?: string
  deployedLink?: string
  createdAt: string
  abstract?: string
  implementation?: string
  ppt?: string
  poster?: string
  evaluationRubrics?: string
  progressReport?: { date: string; text: string }[]
}

export default function EditProject({ params }: { params: { projectId: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    abstract: "",
    implementation: "",
    githubLink: "",
    deployedLink: "",
    status: "in-progress" as "in-progress" | "completed" | "on-hold",
    ppt: "",
    poster: "",
    evaluationRubrics: "",
    yuktiSubmission: ""
  })
  const [teamMembers, setTeamMembers] = useState<{
    name: string
    rollNumber: string
    branch: string
    section: string
    contact: string
    email: string
    graduationYear: string
  }[]>([])
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)

  useEffect(() => {
    fetchProject()
  }, [params.projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/public/projects/${params.projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data.project)
        setFormData({
          title: data.project.title || "",
          description: data.project.description || "",
          abstract: data.project.abstract || "",
          implementation: data.project.implementation || "",
          githubLink: data.project.githubLink || "",
          deployedLink: data.project.deployedLink || "",
          status: data.project.status || "in-progress",
          ppt: data.project.ppt || "",
          poster: data.project.poster || "",
          evaluationRubrics: data.project.evaluationRubrics || "",
          yuktiSubmission: data.project.yuktiSubmission || ""
        })
        setTeamMembers(data.project.teamMembers || [])
      } else {
        setError("Project not found")
      }
    } catch (error) {
      console.error("Error fetching project:", error)
      setError("An error occurred while fetching the project")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = async (file: File, field: string) => {
    setUploadingFile(field)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({
          ...prev,
          [field]: data.filePath
        }))
      } else {
        setError(`Failed to upload ${field}`)
      }
    } catch (error) {
      console.error(`Error uploading ${field}:`, error)
      setError(`Error uploading ${field}`)
    } finally {
      setUploadingFile(null)
    }
  }

  const addTeamMember = () => {
    setTeamMembers(prev => [...prev, {
      name: "",
      rollNumber: "",
      branch: "",
      section: "",
      contact: "",
      email: "",
      graduationYear: ""
    }])
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setTeamMembers(prev => prev.map((member, i) => 
      i === index ? { ...member, [field]: value } : member
    ))
  }

  const removeTeamMember = (index: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/mentors/projects/${params.projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamMembers
        }),
      })

      if (response.ok) {
        router.push(`/mentors/projects/${params.projectId}`)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update project")
      }
    } catch (error) {
      console.error("Error updating project:", error)
      setError("An error occurred while updating the project")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-1">Project Not Found</h3>
          <p className="text-gray-500 text-sm mb-6">{error || "The requested project could not be found."}</p>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-['Inter','Circular_Std',sans-serif]">
      {/* Header */}
      <header className="bg-white/55 backdrop-blur-2xl border-b border-white/25 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href={`/projects/${params.projectId}`}
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-300 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Edit Project</h1>
                <p className="text-gray-500 mt-1 text-sm">{project.projectCode}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                >
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                required
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Code className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Technical Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Abstract</label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Details</label>
                <textarea
                  name="implementation"
                  value={formData.implementation}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GitHub Repository</label>
                <input
                  type="url"
                  name="githubLink"
                  value={formData.githubLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Live Demo</label>
                <input
                  type="url"
                  name="deployedLink"
                  value={formData.deployedLink}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>
            <div className="space-y-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/40">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-700">Team Member {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={member.rollNumber}
                        onChange={(e) => updateTeamMember(index, 'rollNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                      <input
                        type="text"
                        value={member.branch}
                        onChange={(e) => updateTeamMember(index, 'branch', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Section</label>
                      <input
                        type="text"
                        value={member.section}
                        onChange={(e) => updateTeamMember(index, 'section', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Contact</label>
                      <input
                        type="text"
                        value={member.contact}
                        onChange={(e) => updateTeamMember(index, 'contact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={member.graduationYear}
                        onChange={(e) => updateTeamMember(index, 'graduationYear', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Abstract (DOCX/PDF)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".docx,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'abstract')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                  />
                  {uploadingFile === 'abstract' && (
                    <div className="text-sm text-blue-600">Uploading...</div>
                  )}
                  {formData.abstract && (
                    <div className="text-sm text-green-600">✓ Abstract uploaded</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Presentation (PPT/PDF)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".ppt,.pptx,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ppt')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                  />
                  {uploadingFile === 'ppt' && (
                    <div className="text-sm text-blue-600">Uploading...</div>
                  )}
                  {formData.ppt && (
                    <div className="text-sm text-green-600">✓ Presentation uploaded</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Yukti Submission (Image)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'yuktiSubmission')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                  />
                  {uploadingFile === 'yuktiSubmission' && (
                    <div className="text-sm text-blue-600">Uploading...</div>
                  )}
                  {formData.yuktiSubmission && (
                    <div className="text-sm text-green-600">✓ Yukti submission uploaded</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poster (Image)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'poster')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                  />
                  {uploadingFile === 'poster' && (
                    <div className="text-sm text-blue-600">Uploading...</div>
                  )}
                  {formData.poster && (
                    <div className="text-sm text-green-600">✓ Poster uploaded</div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Evaluation Rubrics (DOCX/PDF)</label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".docx,.pdf"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'evaluationRubrics')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
                  />
                  {uploadingFile === 'evaluationRubrics' && (
                    <div className="text-sm text-blue-600">Uploading...</div>
                  )}
                  {formData.evaluationRubrics && (
                    <div className="text-sm text-green-600">✓ Evaluation rubrics uploaded</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/projects/${params.projectId}`}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-300 text-sm font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
        </form>
      </main>
    </div>
  )
} 