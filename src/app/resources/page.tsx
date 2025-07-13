'use client';

import { useState } from 'react';
import { Search, Filter, BookOpen, FileText, Video, Link, Download, ExternalLink, Calendar, User } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'link' | 'template';
  category: string;
  author: string;
  date: string;
  fileSize?: string;
  duration?: string;
  url?: string;
  downloads: number;
  tags: string[];
}

const hardcodedResources: Resource[] = [
  {
    id: '1',
    title: 'Micro Project Guidelines 2025-26',
    description: 'Comprehensive guide for students undertaking micro projects including submission requirements, evaluation criteria, and best practices.',
    type: 'document',
    category: 'Guidelines',
    author: 'Academic Committee',
    date: '2025-01-15',
    fileSize: '2.4 MB',
    downloads: 156,
    tags: ['guidelines', 'submission', 'evaluation']
  },
  {
    id: '2',
    title: 'Project Proposal Template',
    description: 'Standard template for project proposals with sections for problem statement, methodology, timeline, and expected outcomes.',
    type: 'template',
    category: 'Templates',
    author: 'Project Office',
    date: '2025-01-10',
    fileSize: '1.2 MB',
    downloads: 89,
    tags: ['template', 'proposal', 'format']
  },
  {
    id: '3',
    title: 'Introduction to Micro Projects',
    description: 'Video tutorial explaining the concept of micro projects, their importance, and how to get started.',
    type: 'video',
    category: 'Tutorials',
    author: 'Dr. Sarah Johnson',
    date: '2025-01-08',
    duration: '15:30',
    downloads: 234,
    tags: ['tutorial', 'introduction', 'getting-started']
  },
  {
    id: '4',
    title: 'GitHub Repository Setup Guide',
    description: 'Step-by-step guide for setting up GitHub repositories for micro projects with best practices for collaboration.',
    type: 'document',
    category: 'Technical',
    author: 'IT Support',
    date: '2025-01-12',
    fileSize: '856 KB',
    downloads: 67,
    tags: ['github', 'version-control', 'collaboration']
  },
  {
    id: '5',
    title: 'Mentor-Mentee Communication Protocol',
    description: 'Guidelines for effective communication between mentors and students during project development.',
    type: 'document',
    category: 'Communication',
    author: 'Student Affairs',
    date: '2025-01-05',
    fileSize: '1.8 MB',
    downloads: 123,
    tags: ['communication', 'mentorship', 'protocol']
  },
  {
    id: '6',
    title: 'Project Presentation Tips',
    description: 'Video guide on how to create effective project presentations with examples and common mistakes to avoid.',
    type: 'video',
    category: 'Presentation',
    author: 'Prof. Michael Chen',
    date: '2025-01-14',
    duration: '22:15',
    downloads: 178,
    tags: ['presentation', 'tips', 'public-speaking']
  },
  {
    id: '7',
    title: 'Academic Writing Resources',
    description: 'Collection of links to academic writing resources, citation guides, and research methodology references.',
    type: 'link',
    category: 'Academic',
    author: 'Library Services',
    date: '2025-01-03',
    downloads: 45,
    tags: ['writing', 'academic', 'research']
  },
  {
    id: '8',
    title: 'Progress Report Template',
    description: 'Template for weekly/monthly progress reports with sections for achievements, challenges, and next steps.',
    type: 'template',
    category: 'Templates',
    author: 'Project Office',
    date: '2025-01-11',
    fileSize: '945 KB',
    downloads: 92,
    tags: ['template', 'progress', 'reporting']
  },
  {
    id: '9',
    title: 'Software Development Best Practices',
    description: 'Comprehensive guide covering coding standards, testing methodologies, and deployment practices for software projects.',
    type: 'document',
    category: 'Technical',
    author: 'Software Engineering Dept.',
    date: '2025-01-09',
    fileSize: '3.1 MB',
    downloads: 134,
    tags: ['software', 'development', 'best-practices']
  },
  {
    id: '10',
    title: 'Project Evaluation Rubrics',
    description: 'Detailed evaluation criteria and rubrics used by mentors and evaluators to assess project quality and completion.',
    type: 'document',
    category: 'Evaluation',
    author: 'Academic Committee',
    date: '2025-01-13',
    fileSize: '1.5 MB',
    downloads: 78,
    tags: ['evaluation', 'rubrics', 'criteria']
  }
];

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const categories = [...new Set(hardcodedResources.map(resource => resource.category))];
  const types = [...new Set(hardcodedResources.map(resource => resource.type))];

  const filteredResources = hardcodedResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesType = !selectedType || resource.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'link': return <Link className="w-5 h-5" />;
      case 'template': return <BookOpen className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 text-blue-800';
      case 'video': return 'bg-purple-100 text-purple-800';
      case 'link': return 'bg-green-100 text-green-800';
      case 'template': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access comprehensive resources, templates, and guides to help you succeed in your micro projects.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Resource Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                      {getTypeIcon(resource.type)}
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
                        {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-500">
                      <Download className="w-4 h-4 mr-1" />
                      {resource.downloads}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span className="font-medium">Author:</span>
                    <span className="ml-1">{resource.author}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-1">{new Date(resource.date).toLocaleDateString()}</span>
                  </div>
                  {resource.fileSize && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Size:</span> {resource.fileSize}
                    </div>
                  )}
                  {resource.duration && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span> {resource.duration}
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {resource.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                      +{resource.tags.length - 3} more
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <button className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors">
                  {resource.type === 'link' ? (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      <span>Visit Link</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No resources found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 