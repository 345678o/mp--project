import Cookies from 'js-cookie';

export const logout = () => {
  Cookies.remove('mentorUsername');
  Cookies.remove('adminEmail');
  window.location.href = '/mentors/login';
};

export const isLoggedIn = () => {
  if (typeof window === 'undefined') return false;
  return !!Cookies.get('mentorUsername');
};

export const isAdmin = (): boolean => {
  return !!Cookies.get('adminEmail');
};

export const getCurrentMentor = (): string | null => {
  return Cookies.get('mentorUsername') || null;
};

export const getAdminEmail = (): string | null => {
  return Cookies.get('adminEmail') || null;
}; 