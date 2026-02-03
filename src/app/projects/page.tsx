"use client"

import Link from "next/link"
import { Upload, FolderOpen } from "lucide-react"
import { FloatingNav } from '@/components/ui/floating-navbar'
import { Home as HomeIcon } from 'lucide-react'

export default function ProjectsPage() {
  const navItems = [
    { name: 'Home', link: '/', icon: <HomeIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-['Inter','Circular_Std',sans-serif]">
      <FloatingNav navItems={navItems} />
      
      {/* Header */}
      <div className="pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Projects</h1>
            <p className="text-lg text-gray-600 mb-8">Share and discover amazing projects created by our community</p>
            
            <Link
              href="/projects/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Upload className="w-5 h-5" />
              Upload Your Project
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {/* Empty State */}
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
      </main>
    </div>
  )
}