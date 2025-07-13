import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { validateSession } from '@/data/auth';
import { Project } from '@/data/project.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = validateSession(sessionToken);
    if (!user || user.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const projectData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'classId', 'academicYear', 'teamMembers'];
    for (const field of requiredFields) {
      if (!projectData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate team members
    if (!Array.isArray(projectData.teamMembers) || projectData.teamMembers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one team member is required' },
        { status: 400 }
      );
    }

    // Validate each team member has required fields
    for (const member of projectData.teamMembers) {
      const memberFields = ['name', 'rollNumber', 'branch', 'section', 'contact', 'email', 'graduationYear'];
      for (const field of memberFields) {
        if (!member[field]) {
          return NextResponse.json(
            { success: false, message: `Team member ${field} is required` },
            { status: 400 }
          );
        }
      }
    }

    const projectsCollection = await getCollection('projects');
    const mentorsCollection = await getCollection('mentors');
    
    // Get mentor by _id from session
    const mentor = await mentorsCollection.findOne({ _id: new ObjectId(user._id) });
    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Generate project code
    const projectCode = `MP${Date.now().toString().slice(-6)}`;

    // Create new project
    const newProject: Project = {
      title: projectData.title,
      description: projectData.description,
      image: projectData.image || '',
      problemStatementId: projectData.problemStatementId ? new ObjectId(projectData.problemStatementId) : undefined,
      problemStatementSource: projectData.problemStatementSource || '',
      problemStatementSubmission: projectData.problemStatementSubmission || '',
      yuktiSubmission: projectData.yuktiSubmission || '',
      abstract: projectData.abstract || '',
      ppt: projectData.ppt || '',
      poster: projectData.poster || '',
      innovationChallengeDoc: projectData.innovationChallengeDoc || '',
      evaluationRubrics: projectData.evaluationRubrics || '',
      everythingDoc: projectData.everythingDoc || '',
      classId: projectData.classId ? new ObjectId(projectData.classId) : undefined,
      mentors: [mentor._id!],
      teamMembers: projectData.teamMembers,
      submittedAt: [],
      projectCode,
      implementation: projectData.implementation || '',
      githubLink: projectData.githubLink || '',
      deployedLink: projectData.deployedLink || '',
      status: 'in-progress',
      academicYear: projectData.academicYear,
      completed: false,
      createdAt: new Date(),
      lastUpdated: new Date()
    };

    const result = await projectsCollection.insertOne(newProject);

    // Update mentor's projects_mentored array
    await mentorsCollection.updateOne(
      { _id: mentor._id },
      { $push: { projects_mentored: result.insertedId } }
    );

    // If project is linked to a problem statement, add to previousImplementations
    if (newProject.problemStatementId) {
      const problemsCollection = await getCollection('problemStatements');
      const previousImplementation = {
        projectId: result.insertedId,
        title: newProject.title,
        description: newProject.description,
        year: newProject.academicYear,
        teamMembers: newProject.teamMembers,
        githubLink: newProject.githubLink,
        deployedLink: newProject.deployedLink,
        techStacks: [], // Empty array since Project model doesn't have techStacks
        implementedBy: mentor.username,
        implementationDate: new Date(),
        status: newProject.status
      };
      
      await problemsCollection.updateOne(
        { _id: newProject.problemStatementId },
        { $push: { previousImplementations: previousImplementation } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      projectId: result.insertedId,
      projectCode
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = validateSession(sessionToken);
    if (!user || user.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const academicYear = searchParams.get('academicYear');

    const projectsCollection = await getCollection('projects');
    const mentorsCollection = await getCollection('mentors');
    
    // Get mentor by _id from session
    const mentor = await mentorsCollection.findOne({ _id: new ObjectId(user._id) });
    if (!mentor) {
      return NextResponse.json(
        { success: false, message: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Build filter
    const filter: { mentors: ObjectId; classId?: ObjectId; academicYear?: string } = { mentors: mentor._id };
    if (classId) {
      filter.classId = new ObjectId(classId);
    }
    if (academicYear) {
      filter.academicYear = academicYear;
    }

    const projects = await projectsCollection.find(filter).toArray();
    
    return NextResponse.json({
      success: true,
      projects: projects.map(project => ({
        _id: project._id,
        title: project.title,
        description: project.description,
        image: project.image,
        problemStatementId: project.problemStatementId,
        problemStatementSource: project.problemStatementSource,
        problemStatementSubmission: project.problemStatementSubmission,
        yuktiSubmission: project.yuktiSubmission,
        abstract: project.abstract,
        ppt: project.ppt,
        poster: project.poster,
        innovationChallengeDoc: project.innovationChallengeDoc,
        evaluationRubrics: project.evaluationRubrics,
        everythingDoc: project.everythingDoc,
        mentors: project.mentors,
        teamMembers: project.teamMembers,
        submittedAt: project.submittedAt,
        projectCode: project.projectCode,
        implementation: project.implementation,
        githubLink: project.githubLink,
        deployedLink: project.deployedLink,
        status: project.status,
        academicYear: project.academicYear,
        completed: project.completed,
        createdAt: project.createdAt,
        lastUpdated: project.lastUpdated
      }))
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 