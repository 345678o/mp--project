import { ObjectId } from 'mongodb';

export interface Class {
  _id?: ObjectId;
  name: string;           // e.g., "CSD"
  section: string;        // e.g., "A"
  startDate: Date;
  endDate?: Date;        // When the spell ends
  isActive: boolean;     // Whether the spell is active
  mentors: string[];     // Array of mentor usernames
  facultyMentor: string; // Faculty mentor username
  createdAt: Date;
  lastUpdated: Date;
} 