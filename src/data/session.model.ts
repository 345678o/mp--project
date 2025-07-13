import { ObjectId } from 'mongodb';

export type SessionStatus = 'pending' | 'in-progress' | 'completed' | 'not updated';

export interface Session {
  _id?: ObjectId;
  classId: ObjectId;     // Reference to the Class
  day: string;           // e.g., Monday
  date: Date;
  timeSlot: string;      // e.g., 'Morning' or 'Afternoon'
  slot: 'Morning' | 'Afternoon';
  className: string;     // e.g., 'CSD'
  section: string;       // e.g., 'A'
  batch: string;         // e.g., 'I','II'
  studentMentor1?: string;
  studentMentor2?: string;
  substitutedMentor1?: {
    originalMentor: string;
    substituteMentor: string;
    reason?: string;
  };
  substitutedMentor2?: {
    originalMentor: string;
    substituteMentor: string;
    reason?: string;
  };
  subMentor?: string;
  facultyMentor: string;
  sessionProgress: string;  // Required field for session completion
  attendanceImage: string;  // Required field for session completion
  projectStatus: string;    // Required field for session completion
  projects: ObjectId[];  // Array of Project IDs
  status: SessionStatus;
  academicYear: string;  // e.g., "2024-2025"
  completedBy?: string;  // Username of mentor who completed the session
  lastUpdated: Date;
  completedAt?: Date;
  createdAt: Date;
}