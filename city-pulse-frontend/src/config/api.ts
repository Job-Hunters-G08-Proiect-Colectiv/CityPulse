const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  REPORTS: `${API_BASE_URL}/api/reports`,
  REPORT_BY_ID: (id: string) => `${API_BASE_URL}/api/reports/${id}`,
} as const;

export default API_BASE_URL;