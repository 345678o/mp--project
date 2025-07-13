import { connectToDatabase } from './db';

export async function generateProjectCode(academicYear: string): Promise<string> {
  // Extract year from academic year (e.g., "2024-2025" -> "2024")
  const year = academicYear.split('-')[0];
  
  // Get the next project number for this academic year
  const projectNumber = await getNextProjectNumber(year);
  
  // Return with MP prefix
  return `MP${projectNumber}`;
}

async function getNextProjectNumber(year: string): Promise<string> {
  try {
    const { db } = await connectToDatabase();
    
    // Create the year pattern (e.g., "202526" for 2025-2026)
    const yearPattern = `${year}${(parseInt(year) + 1).toString().slice(-2)}`;
    
    // Find the highest project number for this year
    const lastProject = await db.collection('projects')
      .findOne(
        { 
          projectCode: { $regex: `^MP${yearPattern}` } 
        },
        { 
          sort: { projectCode: -1 } 
        }
      );

    if (!lastProject) {
      // First project for this year
      return `${yearPattern}001`;
    }

    // Extract the number from the last project code
    const lastNumber = parseInt(lastProject.projectCode.slice(-3));
    const nextNumber = lastNumber + 1;
    
    // Format with leading zeros (e.g., 001, 002, etc.)
    return `${yearPattern}${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating project number:', error);
    // Fallback: use timestamp as suffix
    const timestamp = Date.now().toString().slice(-3);
    const yearPattern = `${year}${(parseInt(year) + 1).toString().slice(-2)}`;
    return `${yearPattern}${timestamp}`;
  }
} 