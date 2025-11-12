import axiosInstance from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import type { Comment } from '../types/report';

export interface CreateCommentDto {
  commentText: string;
}

export interface UpdateCommentDto {
  commentText: string;
}

export const commentService = {
  getCommentsByReportId: async (reportId: number): Promise<Comment[]> => {
    const response = await axiosInstance.get<Comment[]>(
      API_ENDPOINTS.COMMENTS_BY_REPORT(reportId.toString())
    );
    return response.data;
  },

  createComment: async (reportId: number, data: CreateCommentDto): Promise<Comment> => {
    const response = await axiosInstance.post<Comment>(
      API_ENDPOINTS.COMMENTS_BY_REPORT(reportId.toString()),
      data
    );
    return response.data;
  },

  updateComment: async (commentId: number, data: UpdateCommentDto): Promise<Comment> => {
    const response = await axiosInstance.put<Comment>(
      API_ENDPOINTS.COMMENT_BY_ID(commentId.toString()),
      data
    );
    return response.data;
  },

  deleteComment: async (commentId: number): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.COMMENT_BY_ID(commentId.toString()));
  },
};

