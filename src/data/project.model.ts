import { ObjectId } from 'mongodb';

export interface Project {
  _id?: ObjectId;
  title: string;
  description: string;
  image?: string;
  problemStatementId?: ObjectId; // Reference to Problem Statement
  problemStatementSource?: string;
  problemStatementSubmission?: string;
  yuktiSubmission?: string; // File path for uploaded image
  abstract?: string; // File path for uploaded document
  ppt?: string; // File path for uploaded presentation
  poster?: string; // File path for uploaded image
  innovationChallengeDoc?: string;
  evaluationRubrics?: string; // File path for uploaded document
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
  progressReport: ProgressReportEntry[]; // Array of progress reports
  createdAt: Date;
  lastUpdated: Date;
}

export interface ProgressReportEntry {
  date: Date;
  text: string;
  mentorId: ObjectId;
  mentorName: string;
} 