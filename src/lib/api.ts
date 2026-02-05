const API_BASE_URL = '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  total?: number;
}

export interface ProjectFormData {
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
}

export interface ProjectFile {
  id: number;
  fileType: string;
  originalName: string;
  filePath: string;
  fileUrl?: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface Project extends ProjectFormData {
  id: number;
  createdAt: string;
  updatedAt: string;
  files?: ProjectFile[];
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Projects API
  async getProjects(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Project[]>> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());

    const query = searchParams.toString();
    return this.request<Project[]>(`/projects${query ? `?${query}` : ''}`);
  }

  async getProject(referenceNo: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${encodeURIComponent(referenceNo)}`);
  }

  async createProject(projectData: ProjectFormData): Promise<ApiResponse<Project>> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(
    referenceNo: string,
    projectData: Partial<ProjectFormData>
  ): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${encodeURIComponent(referenceNo)}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(referenceNo: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/projects/${encodeURIComponent(referenceNo)}`, {
      method: 'DELETE',
    });
  }

  // File Upload API
  async uploadFile(
    referenceNo: string,
    fileType: string,
    file: File
  ): Promise<ApiResponse<ProjectFile>> {
    const formData = new FormData();
    formData.append('referenceNo', referenceNo);
    formData.append('fileType', fileType);
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();