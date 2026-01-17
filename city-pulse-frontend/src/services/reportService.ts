import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import type { Report, ReportCategory, ReportStatus, SeverityLevel } from '../types/report';

export interface CreateReportDto {
  name: string;
  description?: string;
  category: ReportCategory;
  location: { lat: number; lng: number };
  address: string;
  severityLevel: SeverityLevel;
  images?: string[];
   // optional, but recommended so new reports are linked to the selected city
  cityId?: number;
}

export interface UpdateReportDto {
  name?: string;
  description?: string;
  category?: ReportCategory;
  status?: ReportStatus;
  severityLevel?: SeverityLevel;
  upvotes?: number;
}

export const reportService = {
  getAllReports: async (filters?: {
    category?: ReportCategory;
    status?: ReportStatus;
    severityLevel?: SeverityLevel;
    search?: string;
    cityId?: number;
  }): Promise<Report[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severityLevel) params.append('severityLevel', filters.severityLevel);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.cityId) params.append('cityId', String(filters.cityId));

    const response = await axiosInstance.get<Report[]>(
      `${API_ENDPOINTS.REPORTS}?${params.toString()}`
    );
    return response.data;
  },

  getReportById: async (id: number): Promise<Report> => {
    const response = await axiosInstance.get<Report>(
      API_ENDPOINTS.REPORT_BY_ID(id.toString())
    );
    return response.data;
  },

  createReport: async (data: CreateReportDto): Promise<Report> => {
    const response = await axiosInstance.post<Report>(
      API_ENDPOINTS.REPORTS,
      data
    );
    return response.data;
  },

  updateReport: async (id: number, data: UpdateReportDto): Promise<Report> => {
    const response = await axiosInstance.put<Report>(
      API_ENDPOINTS.REPORT_BY_ID(id.toString()),
      data
    );
    return response.data;
  },

  deleteReport: async (id: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.REPORT_BY_ID(id.toString()));
  },
};