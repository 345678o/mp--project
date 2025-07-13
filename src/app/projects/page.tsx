"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Users, ExternalLink, Github, Filter, FolderOpen } from "lucide-react"

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

export default function PublicProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedYear, setSelectedYear] = useState("2024-2025")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [selectedYear, selectedStatus])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedYear) params.append("academicYear", selectedYear)
      if (selectedStatus) params.append("status", selectedStatus)
      const response = await fetch(`/api/public/projects?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects || [])
      } else {
        setError("Failed to fetch projects")
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("An error occurred while fetching projects")
    } finally {
      setLoading(false)
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓"
      case "in-progress":
        return "●"
      case "on-hold":
        return "⏸"
      default:
        return "●"
    }
  }

  const projectsByYear = projects.reduce(
    (acc, project) => {
      const year = project.academicYear
      if (!acc[year]) acc[year] = []
      acc[year].push(project)
      return acc
    },
    {} as Record<string, Project[]>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading projects...</p>
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
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Public Projects</h1>
              <p className="text-gray-500 mt-1 text-sm">Browse student projects and collaborations</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-300 text-sm font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Filters */}
        <div className="bg-white/55 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/25 p-6 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <h2 className="text-sm font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
              >
                <option value="">All Years</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm bg-white/70 backdrop-blur-sm transition-all duration-300"
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
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Projects */}
        {Object.keys(projectsByYear).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-1">No Projects Found</h3>
            <p className="text-gray-500 text-sm">Try adjusting the filters to see results.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(projectsByYear).map(([year, yearProjects]) => (
              <div key={year} className="space-y-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Academic Year {year}</h2>
                    <p className="text-gray-500 text-sm">
                      {yearProjects.length} project{yearProjects.length > 1 && "s"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearProjects.map((project) => (
                    <Link
                      key={project._id}
                      href={`/projects/${project.projectCode}`}
                      className="group bg-white/55 backdrop-blur-2xl border border-white/25 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/70 block"
                    >
                                              <div className="flex justify-between items-start mb-4">
                          <span className="text-xs font-medium text-gray-500 bg-white/70 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/40">
                            {project.projectCode}
                          </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm ${getStatusColor(
                            project.status
                          )}`}
                        >
                          <span className="mr-1">{getStatusIcon(project.status)}</span>
                          {project.status.replace("-", " ")}
                        </span>
                      </div>

                      <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">{project.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-3">{project.description}</p>
                      
                      {/* Additional Project Info */}
                      <div className="space-y-2 mb-4">
                        {project.abstract && (
                          <div className="text-xs text-gray-500 line-clamp-2">
                            <span className="font-medium">Abstract:</span> {project.abstract}
                          </div>
                        )}
                        {project.implementation && (
                          <div className="text-xs text-gray-500 line-clamp-2">
                            <span className="font-medium">Tech:</span> {project.implementation}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 mb-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Team ({project.teamMembers.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {project.teamMembers.slice(0, 2).map((member, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                                <span className="text-white text-xs font-semibold">
                                  {member.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm text-gray-800">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-gray-500 ml-1">• {member.branch}</span>
                              </div>
                            </div>
                          ))}
                          {project.teamMembers.length > 2 && (
                            <div className="text-xs text-gray-500 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/40">
                              +{project.teamMembers.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 border-t border-white/40 pt-4">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <Github className="w-3 h-3" />
                            Code
                          </a>
                        )}
                        {project.deployedLink && (
                          <a
                            href={project.deployedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Demo
                          </a>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/40 text-xs text-gray-500">
                        Academic Year: {project.academicYear}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>


    </div>
  )
}
