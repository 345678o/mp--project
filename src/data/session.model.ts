import { ObjectId } from 'mongodb';

export type SessionStatus = 'pending' | 'in-progress' | 'completed';

export interface Session {
  _id?: ObjectId;
  classId: ObjectId;     // Reference to the Class
  day: string;           // e.g., Monday
  date: Date;
  timeSlot: string;      // e.g., 'Morning' or 'Afternoon'
  slot: 'Morning' | 'Afternoon';
  className: string;     // e.g., 'CSD'
  section: string;       // e.g., 'A'
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
  sessionProgress?: string;
  attendanceImage?: string;
  projects: ObjectId[];  // Array of Project IDs
  status: SessionStatus;
  lastUpdated: Date;
  completedAt?: Date;
  createdAt: Date;
}