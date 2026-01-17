const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  REPORTS: `${API_BASE_URL}/api/reports`,
  REPORT_BY_ID: (id: string) => `${API_BASE_URL}/api/reports/${id}`,
  AUTH_LOGIN: `${API_BASE_URL}/api/auth/login`,
  AUTH_SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  HEALTH: `${API_BASE_URL}/health`,
  COMMENTS_BY_REPORT: (reportId: string) => `${API_BASE_URL}/api/reports/${reportId}/comments`,
  COMMENT_BY_ID: (commentId: string) => `${API_BASE_URL}/api/comments/${commentId}`,
} as const;

export default API_BASE_URL;