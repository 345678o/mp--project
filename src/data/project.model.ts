import { ObjectId } from 'mongodb';

export interface Project {
  _id?: ObjectId;
  title: string;
  description: string;
  image?: string;
  problemStatementId?: ObjectId; // Reference to Problem Statement
  problemStatementSource?: string;
  problemStatementSubmission?: string;
  yuktiSubmission?: string;
  abstract?: string;
  ppt?: string;
  poster?: string;
  innovationChallengeDoc?: string;
  evaluationRubrics?: string;
  everythingDoc?: string;
  classId?: ObjectId; // Reference to Class
  mentors: ObjectId[]; // Mentor IDs
  teamMembers: {
    name: string;
    rollNumber: string;
    branch: string;
    section: string;
    contact: string;
    email: string;
    graduationYear: string;
  }[];
  submittedAt: Date[];
  projectCode: string;
  implementation?: string;
  githubLink?: string;
  deployedLink?: string;
  status: 'in-progress' | 'completed' | 'on-hold';
  academicYear: string; // e.g., "2024-2025"
  completed: boolean;
  progressReport?: { date: Date; text: string }[];
  createdAt: Date;
  lastUpdated: Date;
} 