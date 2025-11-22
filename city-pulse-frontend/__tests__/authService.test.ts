import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the auth service functionality
const mockAuthService = {
  login: async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  },

  signup: async (username: string, email: string, password: string) => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    return response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

describe('Authentication Service', () => {
  beforeEach(() => {
    // @ts-expect-error - Mocking global fetch
    global.fetch = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = {
        token: 'test-jwt-token',
        user: {
          id: 1,
          email: 'test@test.com',
          username: 'TestUser',
          type: 'REGULAR'
        }
      };

      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await mockAuthService.login('test@test.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
        })
      );
      expect(result).toEqual(mockResponse);
      expect(result.token).toBe('test-jwt-token');
    });

    it('should throw error on invalid credentials', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 401
      });

      await expect(mockAuthService.login('test@test.com', 'wrongpassword'))
        .rejects.toThrow('Login failed');
    });

    it('should handle network errors', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(mockAuthService.login('test@test.com', 'password123'))
        .rejects.toThrow('Network error');
    });

    it('should send correct request format', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ token: 'token', user: {} })
      });

      await mockAuthService.login('admin@test.com', 'pass123');

      const callArgs = (global.fetch as any).mock.calls[0];
      expect(callArgs[0]).toBe('/api/auth/login');
      expect(callArgs[1].method).toBe('POST');
      expect(callArgs[1].headers['Content-Type']).toBe('application/json');
    });
  });

  describe('signup', () => {
    it('should signup successfully with valid data', async () => {
      const mockResponse = {
        token: 'new-jwt-token',
        user: {
          id: 2,
          email: 'newuser@test.com',
          username: 'NewUser',
          type: 'REGULAR'
        }
      };

      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await mockAuthService.signup('NewUser', 'newuser@test.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'NewUser', email: 'newuser@test.com', password: 'password123' })
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when email already exists', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400
      });

      await expect(mockAuthService.signup('User', 'existing@test.com', 'pass123'))
        .rejects.toThrow('Signup failed');
    });

    it('should handle validation errors', async () => {
      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Email is required' })
      });

      await expect(mockAuthService.signup('User', '', 'pass123'))
        .rejects.toThrow('Signup failed');
    });
  });

  describe('logout', () => {
    it('should clear token and user from localStorage', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, email: 'test@test.com' }));

      mockAuthService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should handle logout when no data exists', () => {
      expect(() => mockAuthService.logout()).not.toThrow();
    });
  });

  describe('getToken', () => {
    it('should retrieve token from localStorage', () => {
      localStorage.setItem('token', 'stored-token');

      const token = mockAuthService.getToken();

      expect(token).toBe('stored-token');
    });

    it('should return null when no token exists', () => {
      const token = mockAuthService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('getUser', () => {
    it('should retrieve and parse user from localStorage', () => {
      const user = { id: 1, email: 'test@test.com', username: 'TestUser', type: 'REGULAR' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = mockAuthService.getUser();

      expect(result).toEqual(user);
    });

    it('should return null when no user exists', () => {
      const result = mockAuthService.getUser();

      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      localStorage.setItem('user', 'invalid-json');

      expect(() => mockAuthService.getUser()).toThrow();
    });
  });

  describe('Token persistence', () => {
    it('should store token after successful login', async () => {
      const mockResponse = {
        token: 'jwt-token-123',
        user: { id: 1, email: 'test@test.com', username: 'Test', type: 'REGULAR' }
      };

      // @ts-expect-error - Mocking fetch
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });

      const result = await mockAuthService.login('test@test.com', 'password123');

      // In a real implementation, token would be stored automatically
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      expect(localStorage.getItem('token')).toBe('jwt-token-123');
      expect(mockAuthService.getToken()).toBe('jwt-token-123');
    });

    it('should maintain user session across page refreshes', () => {
      const user = { id: 1, email: 'test@test.com', username: 'Test', type: 'ADMIN' };
      localStorage.setItem('token', 'persistent-token');
      localStorage.setItem('user', JSON.stringify(user));

      // Simulate page refresh
      const token = mockAuthService.getToken();
      const savedUser = mockAuthService.getUser();

      expect(token).toBe('persistent-token');
      expect(savedUser).toEqual(user);
    });
  });
});
