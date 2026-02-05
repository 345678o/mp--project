import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'data', 'projects.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create tables if they don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      project_type TEXT NOT NULL,
      domain TEXT NOT NULL,
      technologies TEXT, -- JSON array
      github_url TEXT,
      live_url TEXT,
      ppt_url TEXT,
      abstract_url TEXT,
      research_paper_url TEXT,
      working_video_url TEXT,
      academic_year TEXT NOT NULL,
      class TEXT NOT NULL,
      section TEXT NOT NULL,
      batch TEXT NOT NULL,
      team_number TEXT NOT NULL,
      team_lead TEXT NOT NULL,
      team_lead_number TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS project_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      file_type TEXT NOT NULL, -- 'ppt', 'abstract', 'research_paper', 'image', 'documentation'
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER,
      mime_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_reference_no ON projects(reference_no);
    CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
    CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
  `);

  return db;
}

export interface ProjectData {
  id?: number;
  referenceNo: string;
  title: string;
  description: string;
  category: string;
  projectType: string;
  domain: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  pptUrl?: string;
  abstractUrl?: string;
  researchPaperUrl?: string;
  workingVideoUrl?: string;
  academicYear: string;
  class: string;
  section: string;
  batch: string;
  teamNumber: string;
  teamLead: string;
  teamLeadNumber: string;
  authorName: string;
  authorEmail: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFile {
  id?: number;
  projectId: number;
  fileType: 'ppt' | 'abstract' | 'research_paper' | 'image' | 'documentation';
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt?: string;
}