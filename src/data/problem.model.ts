import { ObjectId } from 'mongodb';

interface StudentInfo {
  name: string;
  passoutYear: number;
  branch: string;
  section: string;
  contact: string;
}

export interface ProblemStatement {
  _id?: ObjectId;
  title: string;
  description: string;
  domain: string;
  techStacks: string[];
  source: string;
  application?: string;
  resources?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedDuration: string; // e.g., "2-3 weeks"
  maxTeamSize: number;
  submissions: {
    studentInfo: StudentInfo;
    submissionDate: Date;
    githubLink?: string;
    deployedLink?: string;
    feedback?: string;
  }[];
  previousImplementations: {
    projectId: ObjectId;
    title: string;
    description: string;
    year: string;
    teamMembers: {
      name: string;
      rollNumber: string;
      branch: string;
      section: string;
      contact: string;
      email: string;
      graduationYear: string;
    }[];
    githubLink?: string;
    deployedLink?: string;
    techStacks: string[];
    implementedBy: string;
    implementationDate: Date;
    status: string;
    // Add any other relevant fields from Project
  }[];
  previousAttempts: StudentInfo[];
  createdAt: Date;
  lastUpdated: Date;
  isActive: boolean;
} 