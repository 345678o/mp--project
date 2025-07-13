'use client';

import React from 'react';
import CircularImageGallery from '../components/CircularImageGallery';
import CustomCursor from '../components/ui/CustomCursor';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <CustomCursor />
      <CircularImageGallery />
    </div>
  );
}
