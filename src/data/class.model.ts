import { ObjectId } from 'mongodb';

export interface Class {
  _id?: ObjectId;
  className: string; // e.g., 'CSE', 'ECE', 'CSD'
  section: string; // e.g., 'A', 'B', 'C'
  batch: string; // e.g., '2028', '2029'
  academicYear: string; // e.g., "2024-2025"
  facultyMentor: ObjectId; // Reference to faculty mentor
  studentMentor1: ObjectId; // Reference to first student mentor
  studentMentor2: ObjectId; // Reference to second student mentor
  totalStudents: number;
  activeProjects: ObjectId[]; // Array of active Project IDs
  completedProjects: ObjectId[]; // Array of completed Project IDs
  sessions: ObjectId[]; // Array of Session IDs
  isActive: boolean;
  createdAt: Date;
  lastUpdated: Date;
} 