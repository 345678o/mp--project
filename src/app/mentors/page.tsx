'use client';

import { useState } from 'react';
import { Search, Filter, User, Mail, Phone, MapPin, GraduationCap, Award } from 'lucide-react';

interface Mentor {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  experience: string;
  location: string;
  avatar: string;
  rating: number;
  projectsCompleted: number;
  availability: string;
  bio: string;
}

const hardcodedMentors: Mentor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    department: 'Computer Science',
    specialization: 'Machine Learning, AI',
    experience: '8 years',
    location: 'San Francisco, CA',
    avatar: '/assets/img1.jpg',
    rating: 4.8,
    projectsCompleted: 45,
    availability: 'Available',
    bio: 'Expert in machine learning algorithms and artificial intelligence applications. Passionate about mentoring students in cutting-edge technology projects.'
  },
  {
    id: '2',
    name: 'Prof. Michael Chen',
    email: 'michael.chen@university.edu',
    phone: '+1 (555) 234-5678',
    department: 'Electrical Engineering',
    specialization: 'IoT, Embedded Systems',
    experience: '12 years',
    location: 'Boston, MA',
    avatar: '/assets/img2.jpg',
    rating: 4.9,
    projectsCompleted: 67,
    availability: 'Available',
    bio: 'Specialized in Internet of Things and embedded systems design. Has guided numerous successful micro projects in smart city applications.'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@university.edu',
    phone: '+1 (555) 345-6789',
    department: 'Mechanical Engineering',
    specialization: 'Robotics, Automation',
    experience: '6 years',
    location: 'Austin, TX',
    avatar: '/assets/img3.jpg',
    rating: 4.7,
    projectsCompleted: 38,
    availability: 'Limited',
    bio: 'Robotics enthusiast with expertise in automation systems. Dedicated to helping students build innovative mechanical solutions.'
  },
  {
    id: '4',
    name: 'Prof. David Kim',
    email: 'david.kim@university.edu',
    phone: '+1 (555) 456-7890',
    department: 'Civil Engineering',
    specialization: 'Sustainable Design, Construction',
    experience: '15 years',
    location: 'Seattle, WA',
    avatar: '/assets/img4.jpg',
    rating: 4.6,
    projectsCompleted: 52,
    availability: 'Available',
    bio: 'Civil engineering expert focusing on sustainable design and green building technologies. Mentors projects in environmental engineering.'
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    email: 'lisa.thompson@university.edu',
    phone: '+1 (555) 567-8901',
    department: 'Chemical Engineering',
    specialization: 'Process Optimization, Biofuels',
    experience: '10 years',
    location: 'Houston, TX',
    avatar: '/assets/img5.jpg',
    rating: 4.8,
    projectsCompleted: 41,
    availability: 'Available',
    bio: 'Chemical engineering specialist with focus on process optimization and renewable energy solutions. Guides students in sustainable technology projects.'
  },
  {
    id: '6',
    name: 'Prof. James Wilson',
    email: 'james.wilson@university.edu',
    phone: '+1 (555) 678-9012',
    department: 'Biomedical Engineering',
    specialization: 'Medical Devices, Biomaterials',
    experience: '9 years',
    location: 'San Diego, CA',
    avatar: '/assets/img6.jpg',
    rating: 4.9,
    projectsCompleted: 58,
    availability: 'Available',
    bio: 'Biomedical engineering expert specializing in medical device development and biomaterials research. Mentors innovative healthcare technology projects.'
  }
];

export default function MentorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');

  const departments = [...new Set(hardcodedMentors.map(mentor => mentor.department))];
  const availabilityOptions = [...new Set(hardcodedMentors.map(mentor => mentor.availability))];

  const filteredMentors = hardcodedMentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || mentor.department === selectedDepartment;
    const matchesAvailability = !selectedAvailability || mentor.availability === selectedAvailability;
    
    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Mentors</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet our experienced mentors who guide students through their micro projects, 
            providing expertise, support, and real-world insights.
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
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Department Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Availability</option>
                {availabilityOptions.map(availability => (
                  <option key={availability} value={availability}>{availability}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {filteredMentors.length} mentor{filteredMentors.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Mentor Header */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden">
                      <img 
                        src={mentor.avatar} 
                        alt={mentor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white text-xl font-bold">{mentor.name}</h3>
                      <p className="text-blue-100 text-sm">{mentor.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentor Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(mentor.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({mentor.rating})</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    mentor.availability === 'Available' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {mentor.availability}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{mentor.bio}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span className="font-medium">Specialization:</span>
                    <span className="ml-1">{mentor.specialization}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="w-4 h-4 mr-2" />
                    <span className="font-medium">Experience:</span>
                    <span className="ml-1">{mentor.experience}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="font-medium">Location:</span>
                    <span className="ml-1">{mentor.location}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Projects Completed: {mentor.projectsCompleted}</span>
                </div>

                {/* Contact Buttons */}
                <div className="flex space-x-2">
                  <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition-colors">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-xl hover:bg-green-700 transition-colors">
                    <Phone className="w-4 h-4" />
                    <span>Call</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No mentors found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 