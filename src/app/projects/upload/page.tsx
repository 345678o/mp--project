'use client';

import React, { useState } from 'react';
import { Upload, X, FileText, Image, Link, User, Calendar, Tag } from 'lucide-react';
import { FloatingNav } from '@/components/ui/floating-navbar';
import { Home as HomeIcon } from 'lucide-react';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  projectType: string;
  domain: string;
  class: string;
  section: string;
  academicYear: string;
  teamNumber: string;
  teamLead: string;
  teamLeadNumber: string;
  referenceNo: string;
  technologies: string[];
  githubUrl: string;
  liveUrl: string;
  authorName: string;
  authorEmail: string;
  images: File[];
  documentation: File | null;
}

export default function UploadProject() {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    projectType: '',
    domain: '',
    class: '',
    section: '',
    academicYear: '',
    teamNumber: '',
    teamLead: '',
    teamLeadNumber: '',
    referenceNo: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
    authorName: '',
    authorEmail: '',
    images: [],
    documentation: null,
  });

  const [techInput, setTechInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const navItems = [
    { name: 'Home', link: '/', icon: <HomeIcon className="w-4 h-4" /> },
  ];

  const projectTypes = [
    'Software',
    'Hardware',
    'Software + Hardware'
  ];

  const categories = [
    'Web Development',
    'Mobile App',
    'Data Science',
    'Machine Learning',
    'IoT',
    'Game Development',
    'Desktop Application',
    'API/Backend',
    'DevOps',
    'Other'
  ];

  const domains = [
    'Computer Science',
    'Computer Science & Design',
    'Electronics & Communication',
    'Aerospace Engineering',
    'Mechanical Engineering',
    'Electrical & Electronics',
    'Information Technology',
    'Civil Engineering',
    'Chemical Engineering',
    'Biotechnology',
    'Other'
  ];

  const academicYears = [
    '2024-2025',
    '2023-2024',
    '2022-2023',
    '2021-2022'
  ];

  const classes = [
    'CSE - Computer Science Engineering',
    'CSD - Computer Science & Design',
    'CSM - Computer Science & Mathematics',
    'ECE - Electronics & Communication',
    'AERO - Aerospace Engineering',
    'MECH - Mechanical Engineering',
    'EEE - Electrical & Electronics Engineering'
  ];

  // Dynamic sections based on class (branch)
  const getSectionsForClass = (className: string): string[] => {
    if (!className) return [];
    
    const classCode = className.split(' - ')[0]; // Extract just the code part (CSE, CSD, etc.)
    
    switch (classCode) {
      case 'CSE':
        return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      case 'CSD':
      case 'CSM':
        return ['A', 'B', 'C'];
      case 'ECE':
        return ['A', 'B'];
      case 'AERO':
      case 'MECH':
      case 'EEE':
        return ['A'];
      default:
        return ['A'];
    }
  };

  const availableSections = getSectionsForClass(formData.class);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // If class changes, reset section
    if (name === 'class') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        section: '' // Reset section when class changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTechAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!formData.technologies.includes(techInput.trim())) {
        setFormData(prev => ({
          ...prev,
          technologies: [...prev.technologies, techInput.trim()]
        }));
      }
      setTechInput('');
    }
  };

  const removeTech = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files).filter(file => 
        file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024 // 5MB limit
      );
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
      }));
    }
  };

  const handleDocumentUpload = (file: File | null) => {
    if (file && (file.type === 'application/pdf' || file.type.startsWith('text/'))) {
      setFormData(prev => ({
        ...prev,
        documentation: file
      }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate upload process
    setTimeout(() => {
      alert('Project uploaded successfully! (Demo mode - no actual upload)');
      setIsSubmitting(false);
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        projectType: '',
        domain: '',
        class: '',
        section: '',
        academicYear: '',
        teamNumber: '',
        teamLead: '',
        teamLeadNumber: '',
        referenceNo: '',
        technologies: [],
        githubUrl: '',
        liveUrl: '',
        authorName: '',
        authorEmail: '',
        images: [],
        documentation: null,
      });
      setTechInput('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <FloatingNav navItems={navItems} />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Project</h1>
            <p className="text-lg text-gray-600">Share your amazing work with the community</p>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> This is a demonstration form. No actual upload will occur.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Project Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your project title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reference No *
                  </label>
                  <input
                    type="text"
                    name="referenceNo"
                    value={formData.referenceNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter reference number"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Type *
                  </label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain *
                  </label>
                  <select
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select domain</option>
                    {domains.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your project, its features, and what makes it special..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technologies Used
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={handleTechAdd}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type a technology and press Enter (e.g., React, Node.js, Python)"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Academic Information
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Year *
                  </label>
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class (Branch) *
                  </label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select branch</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section *
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.class || availableSections.length === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!formData.class ? 'Select branch first' : 'Select section'}
                    </option>
                    {availableSections.map(section => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                  {formData.class && availableSections.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available sections for {formData.class.split(' - ')[0]}: {availableSections.join(', ')}
                    </p>
                  )}
                  {formData.class && availableSections.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      No sections available for selected branch
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Team Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <User className="w-6 h-6" />
                Team Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Number *
                  </label>
                  <input
                    type="text"
                    name="teamNumber"
                    value={formData.teamNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Lead *
                  </label>
                  <input
                    type="text"
                    name="teamLead"
                    value={formData.teamLead}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team lead name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Lead Contact *
                  </label>
                  <input
                    type="tel"
                    name="teamLeadNumber"
                    value={formData.teamLeadNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team lead phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="authorName"
                    value={formData.authorName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="authorEmail"
                    value={formData.authorEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Link className="w-6 h-6" />
                Project Links
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GitHub Repository
                  </label>
                  <input
                    type="url"
                    name="githubUrl"
                    value={formData.githubUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://github.com/username/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Live Demo URL
                  </label>
                  <input
                    type="url"
                    name="liveUrl"
                    value={formData.liveUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://your-project.com"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Image className="w-6 h-6" />
                Project Media
              </h2>
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Images (Max 5, 5MB each)
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files)}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                  >
                    Choose Images
                  </label>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documentation Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documentation (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={(e) => handleDocumentUpload(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.documentation && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {formData.documentation.name}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}