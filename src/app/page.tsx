'use client';

import React from 'react';
import CircularImageGallery from '../components/CircularImageGallery';
import CustomCursor from '../components/ui/CustomCursor';
import { FloatingNav } from '../components/ui/floating-navbar';
import { Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const navItems = [
    { name: 'Home', link: '/', icon: <HomeIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      <CustomCursor />
      <FloatingNav navItems={navItems} />
      <CircularImageGallery />
    </div>
  );
}
