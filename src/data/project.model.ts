import { ObjectId } from 'mongodb';

export interface Project {
  _id?: ObjectId;
  title: string;
  description: string;
  image?: string;
  problemStatementSource?: string;
  problemStatementSubmission?: string;
  yuktiSubmission?: string;
  abstract?: string;
  ppt?: string;
  poster?: string;
  innovationChallengeDoc?: string;
  evaluationRubrics?: string;
  everythingDoc?: string;
  mentors: ObjectId[]; // Mentor IDs
  submittedAt: Date[];
  projectCode: string;
  implementation?: string;
  githubLink?: string;
  completed: boolean;
} 