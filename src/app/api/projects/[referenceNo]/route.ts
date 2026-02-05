import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// GET /api/projects/[referenceNo] - Get project by reference number
export async function GET(
  request: NextRequest,
  { params }: { params: { referenceNo: string } }
) {
  try {
    const db = await getDatabase();
    const { referenceNo } = params;

    const project = await db.get(`
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
      FROM projects WHERE reference_no = ?
    `, [referenceNo]);

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get project files
    const files = await db.all(`
      SELECT 
        id,
        file_type as fileType,
        original_name as originalName,
        file_path as filePath,
        file_size as fileSize,
        mime_type as mimeType,
        created_at as createdAt
      FROM project_files WHERE project_id = ?
    `, [project.id]);

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        technologies: project.technologies ? JSON.parse(project.technologies) : [],
        files
      }
    });

  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[referenceNo] - Update project
export async function PUT(
  request: NextRequest,
  { params }: { params: { referenceNo: string } }
) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    const { referenceNo } = params;

    // Check if project exists
    const existingProject = await db.get(
      'SELECT id FROM projects WHERE reference_no = ?',
      [referenceNo]
    );

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const {
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

    // Update project
    await db.run(`
      UPDATE projects SET
        title = ?, description = ?, category = ?, project_type = ?, domain = ?,
        technologies = ?, github_url = ?, live_url = ?, ppt_url = ?,
        abstract_url = ?, research_paper_url = ?, working_video_url = ?,
        academic_year = ?, class = ?, section = ?, batch = ?, team_number = ?,
        team_lead = ?, team_lead_number = ?, author_name = ?, author_email = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE reference_no = ?
    `, [
      title, description, category, projectType, domain,
      JSON.stringify(technologies || []), githubUrl, liveUrl, pptUrl,
      abstractUrl, researchPaperUrl, workingVideoUrl, academicYear,
      className, section, batch, teamNumber, teamLead, teamLeadNumber,
      authorName, authorEmail, referenceNo
    ]);

    // Fetch updated project
    const updatedProject = await db.get(`
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
      FROM projects WHERE reference_no = ?
    `, [referenceNo]);

    return NextResponse.json({
      success: true,
      data: {
        ...updatedProject,
        technologies: updatedProject.technologies ? JSON.parse(updatedProject.technologies) : []
      }
    });

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[referenceNo] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { referenceNo: string } }
) {
  try {
    const db = await getDatabase();
    const { referenceNo } = params;

    // Check if project exists
    const existingProject = await db.get(
      'SELECT id FROM projects WHERE reference_no = ?',
      [referenceNo]
    );

    if (!existingProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Delete project (files will be deleted by CASCADE)
    await db.run('DELETE FROM projects WHERE reference_no = ?', [referenceNo]);

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}