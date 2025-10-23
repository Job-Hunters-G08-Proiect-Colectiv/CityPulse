import { API_ENDPOINTS } from '../config/api';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from '../types/report';

export interface CreateReportDto {
  name: string;
  description?: string;
  category: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  severityLevel: string;
  images?: string[];
}

export interface ReportFilters {
  category?: ReportCategory;
  status?: ReportStatus;
  severityLevel?: SeverityLevel;
  search?: string;
}

export const reportService = {
  async getAllReports(filters?: ReportFilters): Promise<Report[]> {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) {
      queryParams.append('category', filters.category);
    }
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    if (filters?.severityLevel) {
      queryParams.append('severity', filters.severityLevel);
    }
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }

    const url = `${API_ENDPOINTS.REPORTS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  async getReportById(id: number): Promise<Report> {
    const response = await fetch(API_ENDPOINTS.REPORT_BY_ID(id.toString()));
    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }
    return response.json();
  },

  async createReport(data: CreateReportDto): Promise<Report> {
    const response = await fetch(API_ENDPOINTS.REPORTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create report');
    }
    return response.json();
  },

  async updateReport(id: number, data: Partial<Report>): Promise<Report> {
    const response = await fetch(API_ENDPOINTS.REPORT_BY_ID(id.toString()), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update report');
    }
    return response.json();
  },

  async deleteReport(id: number): Promise<void> {
    const response = await fetch(API_ENDPOINTS.REPORT_BY_ID(id.toString()), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
  },
};