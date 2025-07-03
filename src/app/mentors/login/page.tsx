'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const MentorLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Mentor Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required 
          />
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default MentorLogin; 