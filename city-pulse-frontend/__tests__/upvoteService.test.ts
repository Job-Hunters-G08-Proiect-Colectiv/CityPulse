import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { upvoteService } from '../services/upvoteService';

describe('upvoteService', () => {
  beforeEach(() => {
    // @ts-expect-error - Mocking global fetch
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('toggleUpvote', () => {
    it('should toggle upvote successfully', async () => {
      const mockResponse = {
        upvoted: true,
        upvotes: 5
      };

      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await upvoteService.toggleUpvote(1, 'test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/1/upvote'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on 401 unauthorized', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(upvoteService.toggleUpvote(1, 'invalid-token'))
        .rejects.toThrow('Please login to upvote.');
    });

    it('should throw error on other failures', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(upvoteService.toggleUpvote(1, 'test-token'))
        .rejects.toThrow('Failed to toggle upvote.');
    });

    it('should handle network errors', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(upvoteService.toggleUpvote(1, 'test-token'))
        .rejects.toThrow('Network error');
    });

    it('should send correct authorization header', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ upvoted: true, upvotes: 1 })
      });

      await upvoteService.toggleUpvote(1, 'my-secret-token');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer my-secret-token'
          })
        })
      );
    });
  });

  describe('checkUpvoteStatus', () => {
    it('should check upvote status successfully', async () => {
      const mockResponse = {
        upvoted: true
      };

      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await upvoteService.checkUpvoteStatus(1, 'test-token');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/reports/1/upvote-status'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return false when user has not upvoted', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ upvoted: false })
      });

      const result = await upvoteService.checkUpvoteStatus(1, 'test-token');

      expect(result.upvoted).toBe(false);
    });

    it('should throw error on API failure', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500
      });

      await expect(upvoteService.checkUpvoteStatus(1, 'test-token'))
        .rejects.toThrow('Failed to check upvote status.');
    });

    it('should handle authentication errors', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(upvoteService.checkUpvoteStatus(1, 'invalid-token'))
        .rejects.toThrow('Failed to check upvote status.');
    });

    it('should send authorization header with GET request', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ upvoted: false })
      });

      await upvoteService.checkUpvoteStatus(1, 'secure-token');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer secure-token'
          })
        })
      );
    });
  });
});
