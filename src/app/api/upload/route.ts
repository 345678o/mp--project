import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { upload, getFileUrl } from '@/lib/fileUpload';
import { promisify } from 'util';

// Disable Next.js body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// POST /api/upload - Upload files for a project
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const referenceNo = formData.get('referenceNo') as string;
    const fileType = formData.get('fileType') as string;
    const file = formData.get('file') as File;

    if (!referenceNo || !fileType || !file) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Check if project exists
    const project = await db.get(
      'SELECT id FROM projects WHERE reference_no = ?',
      [referenceNo]
    );

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Convert File to Buffer for multer processing
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileData = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      buffer,
      size: file.size
    };

    // Validate file type
    const allowedTypes = {
      ppt: ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      abstract: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      research_paper: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      documentation: ['application/pdf', 'text/plain', 'text/markdown']
    };

    if (!allowedTypes[fileType as keyof typeof allowedTypes]?.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type for this category' },
        { status: 400 }
      );
    }

    // Save file to disk
    const fs = require('fs');
    const path = require('path');
    const { v4: uuidv4 } = require('uuid');

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const subDir = file.type.startsWith('image/') ? 'images' : 'documents';
    const fullUploadDir = path.join(uploadDir, subDir);

    // Ensure directory exists
    if (!fs.existsSync(fullUploadDir)) {
      fs.mkdirSync(fullUploadDir, { recursive: true });
    }

    const uniqueId = uuidv4();
    const extension = path.extname(file.name);
    const filename = `${uniqueId}${extension}`;
    const filePath = path.join(fullUploadDir, filename);

    // Write file
    fs.writeFileSync(filePath, buffer);

    // Save file info to database
    const result = await db.run(`
      INSERT INTO project_files (
        project_id, file_type, original_name, file_path, file_size, mime_type
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      project.id,
      fileType,
      file.name,
      filePath,
      file.size,
      file.type
    ]);

    const fileUrl = getFileUrl(filePath);

    return NextResponse.json({
      success: true,
      data: {
        id: result.lastID,
        fileType,
        originalName: file.name,
        filePath,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}