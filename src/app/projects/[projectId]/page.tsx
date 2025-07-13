"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Users, ExternalLink, Github, FileText, Clock, CheckCircle, PauseCircle, PlayCircle, Award, BookOpen, Code } from "lucide-react"

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
  problemStatementId?: string
  problemStatementSource?: string
  problemStatementSubmission?: string
  yuktiSubmission?: string
  abstract?: string
  ppt?: string
  poster?: string
  innovationChallengeDoc?: string
  evaluationRubrics?: string
  everythingDoc?: string
  implementation?: string
  progressReport?: { date: string; text: string; mentorId: string; mentorName: string }[]
}

export default function ProjectDetail({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")


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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />
      case "in-progress":
        return <PlayCircle className="w-5 h-5 text-blue-600" />
      case "on-hold":
        return <PauseCircle className="w-5 h-5 text-amber-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50/80 text-emerald-700 border-emerald-200/60"
      case "in-progress":
        return "bg-blue-50/80 text-blue-700 border-blue-200/60"
      case "on-hold":
        return "bg-amber-50/80 text-amber-700 border-amber-200/60"
      default:
        return "bg-gray-50/80 text-gray-700 border-gray-200/60"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "on-hold":
        return "On Hold"
      default:
        return "Unknown"
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
                href="/projects"
                className="inline-flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-300 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{project.title}</h1>
                <p className="text-gray-500 mt-1 text-sm">Project Details</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-gray-500 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/40">
                {project.projectCode}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {getStatusText(project.status)}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Overview */}
            <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Project Overview</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{project.description}</p>
              
              {project.abstract && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Abstract</h3>
                  <p className="text-gray-600 leading-relaxed">{project.abstract}</p>
                </div>
              )}

              {project.implementation && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Implementation Details</h3>
                  <p className="text-gray-600 leading-relaxed">{project.implementation}</p>
                </div>
              )}
            </div>

            {/* Team Members */}
            <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Team Members ({project.teamMembers.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.teamMembers.map((member, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/40">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white text-sm font-semibold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-sm text-gray-600">{member.branch} • {member.section}</p>
                      <p className="text-xs text-gray-500">{member.rollNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Reports */}
            {project.progressReport && project.progressReport.length > 0 && (
              <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Progress Reports</h2>
                </div>
                <div className="space-y-4">
                  {project.progressReport.map((report, index) => (
                    <div key={index} className="p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-white/40">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">by {report.mentorName}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{report.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Implementation */}
            {project.implementation && (
              <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Code className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Technical Implementation</h2>
                </div>
                <p className="text-gray-600 leading-relaxed">{project.implementation}</p>
              </div>
            )}

            {/* Awards & Recognition */}
            {project.evaluationRubrics && (
              <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Evaluation & Awards</h2>
                </div>
                <div className="space-y-3">
                  <a
                    href={project.evaluationRubrics}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-all duration-300 font-medium border border-white/40"
                  >
                    <FileText className="w-4 h-4" />
                    View Evaluation Rubrics
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Academic Year: {project.academicYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Links */}
            <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Links</h3>
              <div className="space-y-3">
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 bg-gray-900/90 backdrop-blur-sm text-white rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <Github className="w-4 h-4" />
                    View Code
                  </a>
                )}
                {project.deployedLink && (
                  <a
                    href={project.deployedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Documents */}
            {(project.ppt || project.poster || project.abstract || project.evaluationRubrics) && (
              <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="space-y-2">
                  {project.ppt && (
                    <a
                      href={project.ppt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-all duration-300 text-sm border border-white/40"
                    >
                      <FileText className="w-4 h-4" />
                      Presentation
                    </a>
                  )}
                  {project.poster && (
                    <a
                      href={project.poster}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-all duration-300 text-sm border border-white/40"
                    >
                      <FileText className="w-4 h-4" />
                      Poster
                    </a>
                  )}
                  {project.evaluationRubrics && (
                    <a
                      href={project.evaluationRubrics}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-3 py-2 text-gray-700 bg-white/70 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-all duration-300 text-sm border border-white/40"
                    >
                      <FileText className="w-4 h-4" />
                      Evaluation Rubrics
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>


    </div>
  )
} 