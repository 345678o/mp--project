"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Upload, FolderOpen, ExternalLink, Tag, Calendar, User, Edit, FileText, Video, Presentation, Search } from "lucide-react"
import { FloatingNav } from '@/components/ui/floating-navbar'
import { Home as HomeIcon } from 'lucide-react'

interface SavedProject {
  id: number;
  referenceNo: string;
  title: string;
  description: string;
  category: string;
  projectType: string;
  domain: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  pptUrl?: string;
  abstractUrl?: string;
  researchPaperUrl?: string;
  workingVideoUrl?: string;
  academicYear: string;
  class: string;
  section: string;
  batch: string;
  teamNumber: string;
  teamLead: string;
  teamLeadNumber: string;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
  files?: Array<{
    id: number;
    fileType: string;
    originalName: string;
    filePath: string;
    fileUrl?: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
  }>;
}

export default function ProjectsPage() {
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([])
  const [filteredProjects, setFilteredProjects] = useState<SavedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const navItems = [
    { name: 'Home', link: '/', icon: <HomeIcon className="w-4 h-4" /> },
  ]

  useEffect(() => {
    loadSavedProjects()
  }, [])

  // Filter projects based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(savedProjects)
    } else {
      const filtered = savedProjects.filter(project =>
        project.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectInfo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.teamInfo.teamLead.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.teamInfo.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, savedProjects])

  const loadSavedProjects = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        // Sort by creation date (newest first)
        const sortedProjects = result.data.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setSavedProjects(sortedProjects);
        setFilteredProjects(sortedProjects);
      } else {
        console.error('Failed to load projects:', result.error);
        setSavedProjects([]);
        setFilteredProjects([]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setSavedProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  }

  const editProject = (project: SavedProject) => {
    // Create URL with project data as query parameters
    const editUrl = `/projects/upload?edit=${encodeURIComponent(project.referenceNo)}`
    window.location.href = editUrl
  }

  const getProjectTypeColor = (type: string) => {
    switch (type) {
      case 'Software':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Hardware':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'Software + Hardware':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <FloatingNav navItems={navItems} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter','Circular_Std',sans-serif]">
      <FloatingNav navItems={navItems} />
      
      {/* Header */}
      <div className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Projects</h1>
            <p className="text-lg text-gray-600 mb-8">Discover amazing projects created by our community</p>
            
            <div className="flex justify-center">
              <Link
                href="/projects/upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Upload className="w-5 h-5" />
                Upload Your Project
              </Link>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by reference number, title, team lead, or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  {filteredProjects.length} result{filteredProjects.length !== 1 ? 's' : ''} found for "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {filteredProjects.length === 0 && !searchQuery ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <FolderOpen className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Projects Yet</h3>
            <p className="text-gray-500 text-sm mb-6">Be the first to share your amazing project with the community!</p>
            <Link
              href="/projects/upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Project
            </Link>
          </div>
        ) : filteredProjects.length === 0 && searchQuery ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Projects Found</h3>
            <p className="text-gray-500 text-sm mb-6">No projects match your search criteria "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                {searchQuery ? (
                  <>
                    {filteredProjects.length} Project{filteredProjects.length > 1 ? 's' : ''} Found
                    <span className="text-lg font-normal text-gray-600 ml-2">
                      for "{searchQuery}"
                    </span>
                  </>
                ) : (
                  <>
                    {savedProjects.length} Project{savedProjects.length > 1 ? 's' : ''} Found
                  </>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div
                  key={project.referenceNo}
                  className="group bg-white/70 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white/80"
                >
                  {/* Reference Number Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded border">
                      {project.referenceNo}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProject(project)}
                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        title="Edit project"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>
                      <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border ${getProjectTypeColor(project.projectType)}`}>
                        {project.projectType}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                    {project.description}
                  </p>

                  {/* Domain & Category */}
                  <div className="flex gap-2 mb-4">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                      {project.domain}
                    </span>
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md">
                      {project.category}
                    </span>
                  </div>

                  {/* Technologies */}
                  {project.technologies.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 text-xs bg-gray-100/70 text-gray-700 px-2 py-1 rounded-md"
                          >
                            <Tag className="w-3 h-3" />
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{project.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Academic Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Academic Info</span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{project.academicYear} • {project.class.split(' - ')[0]}</div>
                      <div>Section {project.section} • {project.batch}</div>
                    </div>
                  </div>

                  {/* Team Info */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Team {project.teamNumber}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div><strong>Lead:</strong> {project.teamLead}</div>
                      <div><strong>Submitted by:</strong> {project.authorName}</div>
                    </div>
                  </div>

                  {/* Links */}
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {project.projectInfo.githubUrl && (
                        <a
                          href={project.projectInfo.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                          Code
                        </a>
                      )}
                      {project.projectInfo.liveUrl && (
                        <a
                          href={project.projectInfo.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Demo
                        </a>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {(project.projectInfo.pptUrl || project.media?.pptFile) && (
                        <a
                          href={project.projectInfo.pptUrl || '#'}
                          target={project.projectInfo.pptUrl ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            project.projectInfo.pptUrl 
                              ? 'bg-orange-100 hover:bg-orange-200 text-orange-700 cursor-pointer' 
                              : 'bg-orange-50 text-orange-600 cursor-default'
                          }`}
                          onClick={!project.projectInfo.pptUrl ? (e) => e.preventDefault() : undefined}
                          title={project.media?.pptFile ? `File: ${project.media.pptFile}` : 'View presentation'}
                        >
                          <Presentation className="w-3 h-3" />
                          {project.media?.pptFile ? 'PPT (File)' : 'PPT'}
                        </a>
                      )}
                      {(project.projectInfo.abstractUrl || project.media?.abstractFile) && (
                        <a
                          href={project.projectInfo.abstractUrl || '#'}
                          target={project.projectInfo.abstractUrl ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            project.projectInfo.abstractUrl 
                              ? 'bg-green-100 hover:bg-green-200 text-green-700 cursor-pointer' 
                              : 'bg-green-50 text-green-600 cursor-default'
                          }`}
                          onClick={!project.projectInfo.abstractUrl ? (e) => e.preventDefault() : undefined}
                          title={project.media?.abstractFile ? `File: ${project.media.abstractFile}` : 'View abstract'}
                        >
                          <FileText className="w-3 h-3" />
                          {project.media?.abstractFile ? 'Abstract (File)' : 'Abstract'}
                        </a>
                      )}
                      {(project.projectInfo.researchPaperUrl || project.media?.researchPaperFile) && (
                        <a
                          href={project.projectInfo.researchPaperUrl || '#'}
                          target={project.projectInfo.researchPaperUrl ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            project.projectInfo.researchPaperUrl 
                              ? 'bg-purple-100 hover:bg-purple-200 text-purple-700 cursor-pointer' 
                              : 'bg-purple-50 text-purple-600 cursor-default'
                          }`}
                          onClick={!project.projectInfo.researchPaperUrl ? (e) => e.preventDefault() : undefined}
                          title={project.media?.researchPaperFile ? `File: ${project.media.researchPaperFile}` : 'View research paper'}
                        >
                          <FileText className="w-3 h-3" />
                          {project.media?.researchPaperFile ? 'Paper (File)' : 'Paper'}
                        </a>
                      )}
                      {project.projectInfo.workingVideoUrl && (
                        <a
                          href={project.projectInfo.workingVideoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs px-2 py-1 rounded transition-colors"
                        >
                          <Video className="w-3 h-3" />
                          Video
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Submission Date */}
                  <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-500">
                    Submitted: {new Date(project.metadata.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}