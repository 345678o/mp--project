// Simple authentication system without bcrypt
export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'mentor';
}

// Hardcoded admin credentials
export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123', // Simple password for demo
  email: 'admin@microprojects.com',
  role: 'admin' as const
};

// Simple password comparison (for demo purposes)
export const comparePassword = (plainPassword: string, hashedPassword: string): boolean => {
  // In a real application, you would use proper hashing
  // For now, we'll use simple comparison
  return plainPassword === hashedPassword;
};

// Simple password hashing (for demo purposes)
export const hashPassword = (password: string): string => {
  // In a real application, you would use proper hashing
  // For now, we'll return the password as-is
  return password;
};

// Session management
export const createSession = (user: AuthUser): string => {
  // Simple session token generation
  const token = `${user._id}-${user.role}-${Date.now()}`;
  return Buffer.from(token).toString('base64');
};

export const validateSession = (token: string): AuthUser | null => {
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [id, role, timestamp] = decoded.split('-');
    
    // Check if session is not too old (24 hours)
    const sessionAge = Date.now() - parseInt(timestamp);
    if (sessionAge > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return {
      _id: id,
      username: '', // Will be filled from database
      email: '', // Will be filled from database
      role: role as 'admin' | 'mentor'
    };
  } catch {
    return null;
  }
};

// Check if user is logged in (for client-side use)
export const isLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for admin email cookie
  const adminEmail = document.cookie
    .split('; ')
    .find(row => row.startsWith('adminEmail='));
  
  // Check for mentor username cookie
  const mentorUsername = document.cookie
    .split('; ')
    .find(row => row.startsWith('mentorUsername='));
  
  return !!(adminEmail || mentorUsername);
};

// Logout function (for client-side use)
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove all auth cookies
  document.cookie = 'adminEmail=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'mentorUsername=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  
  // Redirect to home page
  window.location.href = '/';
}; 