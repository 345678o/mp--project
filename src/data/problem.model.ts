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
  submissions: {
    studentInfo: StudentInfo;
    submissionDate: Date;
    githubLink?: string;
    deployedLink?: string;
    feedback?: string;
  }[];
  previousImplementations: {
    description: string;
    githubLink?: string;
    deployedLink?: string;
    techStack: string[];
    implementedBy: string;
    implementationDate: Date;
  }[];
  previousAttempts: StudentInfo[];
  createdAt: Date;
  lastUpdated: Date;
  isActive: boolean;
} 