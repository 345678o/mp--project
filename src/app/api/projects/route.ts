import { NextRequest, NextResponse } from 'next/server';
import { getDatabase, ProjectData } from '@/lib/database';

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT 
        id,
        reference_no as referenceNo,
        title,
        description,
        category,
        project_type as projectType,
        domain,
        technologies,
        github_url as githubUrl,
        live_url as liveUrl,
        ppt_url as pptUrl,
        abstract_url as abstractUrl,
        research_paper_url as researchPaperUrl,
        working_video_url as workingVideoUrl,
        academic_year as academicYear,
        class,
        section,
        batch,
        team_number as teamNumber,
        team_lead as teamLead,
        team_lead_number as teamLeadNumber,
        author_name as authorName,
        author_email as authorEmail,
        created_at as createdAt,
        updated_at as updatedAt
      FROM projects
    `;

    const params: any[] = [];

    if (search) {
      query += ` WHERE 
        reference_no LIKE ? OR 
        title LIKE ? OR 
        team_lead LIKE ? OR 
        author_name LIKE ?
      `;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const projects = await db.all(query, params);

    // Parse technologies JSON for each project
    const formattedProjects = projects.map(project => ({
      ...project,
      technologies: project.technologies ? JSON.parse(project.technologies) : []
    }));

    return NextResponse.json({
      success: true,
      data: formattedProjects,
      total: formattedProjects.length
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();

    const {
      referenceNo,
      title,
      description,
      category,
      projectType,
      domain,
      technologies,
      githubUrl,
      liveUrl,
      pptUrl,
      abstractUrl,
      researchPaperUrl,
      workingVideoUrl,
      academicYear,
      class: className,
      section,
      batch,
      teamNumber,
      teamLead,
      teamLeadNumber,
      authorName,
      authorEmail
    } = body;

    // Validate required fields
    if (!referenceNo || !title || !description || !category || !projectType || 
        !domain || !academicYear || !className || !section || !batch || 
        !teamNumber || !teamLead || !teamLeadNumber || !authorName || !authorEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if reference number already exists
    const existingProject = await db.get(
      'SELECT id FROM projects WHERE reference_no = ?',
      [referenceNo]
    );

    if (existingProject) {
      return NextResponse.json(
        { success: false, error: 'Reference number already exists' },
        { status: 409 }
      );
    }

    // Insert project
    const result = await db.run(`
      INSERT INTO projects (
        reference_no, title, description, category, project_type, domain,
        technologies, github_url, live_url, ppt_url, abstract_url,
        research_paper_url, working_video_url, academic_year, class,
        section, batch, team_number, team_lead, team_lead_number,
        author_name, author_email
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      referenceNo, title, description, category, projectType, domain,
      JSON.stringify(technologies || []), githubUrl, liveUrl, pptUrl,
      abstractUrl, researchPaperUrl, workingVideoUrl, academicYear,
      className, section, batch, teamNumber, teamLead, teamLeadNumber,
      authorName, authorEmail
    ]);

    const projectId = result.lastID;

    // Fetch the created project
    const createdProject = await db.get(`
      SELECT 
        id,
        reference_no as referenceNo,
        title,
        description,
        category,
        project_type as projectType,
        domain,
        technologies,
        github_url as githubUrl,
        live_url as liveUrl,
        ppt_url as pptUrl,
        abstract_url as abstractUrl,
        research_paper_url as researchPaperUrl,
        working_video_url as workingVideoUrl,
        academic_year as academicYear,
        class,
        section,
        batch,
        team_number as teamNumber,
        team_lead as teamLead,
        team_lead_number as teamLeadNumber,
        author_name as authorName,
        author_email as authorEmail,
        created_at as createdAt,
        updated_at as updatedAt
      FROM projects WHERE id = ?
    `, [projectId]);

    return NextResponse.json({
      success: true,
      data: {
        ...createdProject,
        technologies: createdProject.technologies ? JSON.parse(createdProject.technologies) : []
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}