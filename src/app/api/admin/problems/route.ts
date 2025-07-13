import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db';
import { ProblemStatement } from '@/data/problem.model';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const problemData = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'domain', 'source', 'difficulty', 'estimatedDuration', 'maxTeamSize'];
    for (const field of requiredFields) {
      if (!problemData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const problemsCollection = await getCollection('problemStatements');
    
    // Check if title already exists
    const existingProblem = await problemsCollection.findOne({ 
      title: problemData.title
    });
    if (existingProblem) {
      return NextResponse.json(
        { success: false, message: 'Problem statement with this title already exists' },
        { status: 409 }
      );
    }

    // Create new problem statement
    const newProblem: ProblemStatement = {
      title: problemData.title,
      description: problemData.description,
      domain: problemData.domain,
      techStacks: problemData.techStacks || [],
      source: problemData.source,
      application: problemData.application || '',
      resources: problemData.resources || '',
      difficulty: problemData.difficulty,
      estimatedDuration: problemData.estimatedDuration,
      maxTeamSize: problemData.maxTeamSize,
      submissions: [],
      previousImplementations: [],
      previousAttempts: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      isActive: true
    };

    const result = await problemsCollection.insertOne(newProblem);

    return NextResponse.json({
      success: true,
      message: 'Problem statement created successfully',
      problemId: result.insertedId
    });
  } catch (error) {
    console.error('Error creating problem statement:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    
    const problemsCollection = await getCollection('problemStatements');
    
    const filter: { isActive?: boolean } = {};
    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }
    
    const problems = await problemsCollection.find(filter).toArray();
    
    return NextResponse.json({
      success: true,
      problems: problems.map(problem => ({
        _id: problem._id,
        title: problem.title,
        description: problem.description,
        domain: problem.domain,
        techStacks: problem.techStacks,
        source: problem.source,
        application: problem.application,
        resources: problem.resources,
        difficulty: problem.difficulty,
        estimatedDuration: problem.estimatedDuration,
        maxTeamSize: problem.maxTeamSize,
        isActive: problem.isActive,
        createdAt: problem.createdAt,
        lastUpdated: problem.lastUpdated,
        previousImplementations: problem.previousImplementations,
        submissions: problem.submissions,
        previousAttempts: problem.previousAttempts
      }))
    });
  } catch (error) {
    console.error('Error fetching problem statements:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('id');
    
    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    const problemsCollection = await getCollection('problemStatements');
    
         const result = await problemsCollection.updateOne(
       { _id: new ObjectId(problemId) },
       { 
         $set: {
           ...updateData,
           lastUpdated: new Date()
         }
       }
     );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem statement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Problem statement updated successfully'
    });
  } catch (error) {
    console.error('Error updating problem statement:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemId = searchParams.get('id');
    
    if (!problemId) {
      return NextResponse.json(
        { success: false, message: 'Problem ID is required' },
        { status: 400 }
      );
    }

    const problemsCollection = await getCollection('problemStatements');
    
         const result = await problemsCollection.deleteOne({ _id: new ObjectId(problemId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Problem statement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Problem statement deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting problem statement:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 