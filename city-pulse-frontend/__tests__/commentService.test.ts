import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { commentService } from '../services/commentService';
import axiosInstance from '../config/axios';

// Mock axios
vi.mock('../config/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('commentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCommentsByReportId', () => {
    it('should fetch comments for a report', async () => {
      const mockComments = [
        {
          id: 1,
          reportId: 1,
          userId: 1,
          commentText: 'Test comment',
          createdAt: '2024-01-01T00:00:00.000Z',
          username: 'TestUser',
          userType: 'REGULAR'
        }
      ];

      vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockComments });

      const result = await commentService.getCommentsByReportId(1);

      expect(axiosInstance.get).toHaveBeenCalledWith(expect.stringContaining('/api/reports/1/comments'));
      expect(result).toEqual(mockComments);
    });

    it('should handle empty comments array', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: [] });

      const result = await commentService.getCommentsByReportId(1);

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

      await expect(commentService.getCommentsByReportId(1)).rejects.toThrow('Network error');
    });
  });

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const newComment = { commentText: 'New comment' };
      const mockResponse = {
        id: 1,
        reportId: 1,
        userId: 1,
        commentText: 'New comment',
        createdAt: '2024-01-01T00:00:00.000Z',
        username: 'TestUser',
        userType: 'REGULAR'
      };

      vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

      const result = await commentService.createComment(1, newComment);

      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/1/comments'),
        newComment
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle validation errors', async () => {
      const invalidComment = { commentText: '' };

      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: { status: 400, data: { error: 'Comment text is required' } }
      });

      await expect(commentService.createComment(1, invalidComment)).rejects.toThrow();
    });

    it('should handle authentication errors', async () => {
      const newComment = { commentText: 'Test' };

      vi.mocked(axiosInstance.post).mockRejectedValue({
        response: { status: 401, data: { error: 'Authentication required' } }
      });

      await expect(commentService.createComment(1, newComment)).rejects.toThrow();
    });
  });

  describe('updateComment', () => {
    it('should update an existing comment', async () => {
      const updateData = { commentText: 'Updated comment' };
      const mockResponse = {
        id: 1,
        reportId: 1,
        userId: 1,
        commentText: 'Updated comment',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        username: 'TestUser',
        userType: 'REGULAR'
      };

      vi.mocked(axiosInstance.put).mockResolvedValue({ data: mockResponse });

      const result = await commentService.updateComment(1, updateData);

      expect(axiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/comments/1'),
        updateData
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle authorization errors when updating', async () => {
      const updateData = { commentText: 'Updated' };

      vi.mocked(axiosInstance.put).mockRejectedValue({
        response: { status: 403, data: { error: 'Unauthorized' } }
      });

      await expect(commentService.updateComment(1, updateData)).rejects.toThrow();
    });

    it('should handle not found errors', async () => {
      const updateData = { commentText: 'Updated' };

      vi.mocked(axiosInstance.put).mockRejectedValue({
        response: { status: 404, data: { error: 'Comment not found' } }
      });

      await expect(commentService.updateComment(999, updateData)).rejects.toThrow();
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({ data: { message: 'Comment deleted' } });

      await commentService.deleteComment(1);

      expect(axiosInstance.delete).toHaveBeenCalledWith(
        expect.stringContaining('/api/comments/1')
      );
    });

    it('should handle authorization errors when deleting', async () => {
      vi.mocked(axiosInstance.delete).mockRejectedValue({
        response: { status: 403, data: { error: 'Unauthorized' } }
      });

      await expect(commentService.deleteComment(1)).rejects.toThrow();
    });

    it('should handle not found errors when deleting', async () => {
      vi.mocked(axiosInstance.delete).mockRejectedValue({
        response: { status: 404, data: { error: 'Comment not found' } }
      });

      await expect(commentService.deleteComment(999)).rejects.toThrow();
    });
  });
});
