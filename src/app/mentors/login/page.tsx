'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';

const MentorLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Attempting login with username:', username);
    
    try {
      const res = await fetch('/api/mentors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        const { email, isAdmin } = data;
        console.log('Login response:', { email, isAdmin });
        
        if (isAdmin) {
          console.log('User is admin, storing email in cookie');
          Cookies.set('adminEmail', email, { expires: 7 }); // 7 days expiry
          Cookies.remove('mentorUsername'); // Remove mentor credentials if any
          
          // Use window.location for a full page refresh to admin dashboard
          window.location.href = '/admin/dashboard';
          return; // Exit early for admin
        }
        
        // Handle mentor login
        console.log('User is mentor, storing username in cookie');
        Cookies.set('mentorUsername', username, { expires: 7 }); // 7 days expiry
        Cookies.remove('adminEmail'); // Remove admin credentials if any
        
        // Use router.push for mentor dashboard
        router.push('/mentors/dashboard');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">MP</span>
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">Micro Projects</h1>
              <p className="text-sm text-gray-600">Management System</p>
            </div>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">👨‍🏫</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Mentor Login
              </h2>
              <p className="text-gray-600">
                Access your sessions and projects
              </p>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input 
                  id="username"
                  type="text" 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your username"
                  required 
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your password"
                  required 
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <button 
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-900 mb-1">Need Access?</h4>
                <p className="text-sm text-green-700">
                  Contact your administrator to create a mentor account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorLogin; 