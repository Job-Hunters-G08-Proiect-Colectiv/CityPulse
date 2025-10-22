import { API_ENDPOINTS } from '../config/api';
import type { Report } from '../types/report';

export interface CreateReportDto {
  title: string;
  description: string;
  category: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
}

export const reportService = {
  async getAllReports(): Promise<Report[]> {
    const response = await fetch(API_ENDPOINTS.REPORTS);
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  async getReportById(id: string): Promise<Report> {
    const response = await fetch(API_ENDPOINTS.REPORT_BY_ID(id));
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
      throw new Error('Failed to create report');
    }
    return response.json();
  },

  async updateReport(id: string, data: Partial<CreateReportDto>): Promise<Report> {
    const response = await fetch(API_ENDPOINTS.REPORT_BY_ID(id), {
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

  async deleteReport(id: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.REPORT_BY_ID(id), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
  },
};