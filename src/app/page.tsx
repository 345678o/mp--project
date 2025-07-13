'use client';

import React from 'react';
import CircularImageGallery from '../components/CircularImageGallery';
import CustomCursor from '../components/ui/CustomCursor';
import { FloatingNav } from '../components/ui/floating-navbar';
import { Home as HomeIcon, Users, BookOpen, FolderOpen, FileText } from 'lucide-react';

export default function Home() {
  const navItems = [
    { name: 'Home', link: '/', icon: <HomeIcon className="w-4 h-4" /> },
    { name: 'Our Mentors', link: '/mentors', icon: <Users className="w-4 h-4" /> },
    { name: 'Resources', link: '/resources', icon: <BookOpen className="w-4 h-4" /> },
    { name: 'Problem Statements', link: '/problems', icon: <FileText className="w-4 h-4" /> },
    { name: 'Projects', link: '/projects', icon: <FolderOpen className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <CustomCursor />
      <FloatingNav navItems={navItems} />
      <CircularImageGallery />
    </div>
  );
}
