import { ObjectId } from 'mongodb';

export interface Mentor {
  _id?: ObjectId;
  username: string;
  password: string;
  email: string;
  phone: string;
  Branch: string;
  Section: string;
  CIE_Department: string;
  GraduationYear: string;
  CurrentYear: string;
  sessions_taken_overall: string;
  current_sem_sessions_taken: string;
  projects: ObjectId[]; // Array of Project IDs
  current_mentoring_class: ObjectId | null; // Class/Session ID
  // Additional fields
  skills: string[];
  hobbies: string[];
  linkedin?: string;
  github?: string;
  projects_mentored: ObjectId[]; // Array of Project IDs that this mentor has mentored
  academicYear: string; // e.g., "2024-2025"
  role: 'student' | 'faculty'; // Role of the mentor
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
} 