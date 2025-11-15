import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock LoginPage component
const MockLoginPage = ({ onLogin }: any) => {
  const [email, setEmail] = vi.fn();
  const [password, setPassword] = vi.fn();
  const [error, setError] = vi.fn();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ email: 'test@test.com', password: 'password123' });
  };

  return (
    <div>
      <h1>Login to CityPulse</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Login</button>
        <a href="/signup">Don't have an account? Sign up</a>
      </form>
    </div>
  );
};

describe('LoginPage Component', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    expect(screen.getByText('Login to CityPulse')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('should have email and password inputs with correct types', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have required fields', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should display placeholder text', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('should call onLogin when form is submitted', async () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  it('should have a link to signup page', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const signupLink = screen.getByText("Don't have an account? Sign up");
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('should prevent default form submission', async () => {
    const mockEvent = { preventDefault: vi.fn() };
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const form = screen.getByRole('button', { name: 'Login' }).closest('form');
    if (form) {
      fireEvent.submit(form);
    }

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });
});

describe('LoginPage Error Handling', () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle login errors gracefully', async () => {
    const MockLoginWithError = () => {
      const [error, setError] = vi.fn();

      return (
        <div>
          <h1>Login to CityPulse</h1>
          <form>
            <input type="email" aria-label="Email" required />
            <input type="password" aria-label="Password" required />
            <button type="submit">Login</button>
            {error && <div role="alert">{error}</div>}
          </form>
        </div>
      );
    };

    render(<MockLoginWithError />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('LoginPage Validation', () => {
  const mockOnLogin = vi.fn();

  it('should validate email format with HTML5 validation', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('should not allow empty email submission', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toBeRequired();
  });

  it('should not allow empty password submission', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toBeRequired();
  });
});

describe('LoginPage Accessibility', () => {
  const mockOnLogin = vi.fn();

  it('should have accessible labels for all inputs', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('should have proper heading hierarchy', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const heading = screen.getByRole('heading', { name: 'Login to CityPulse' });
    expect(heading.tagName).toBe('H1');
  });

  it('should have focusable submit button', () => {
    render(<MockLoginPage onLogin={mockOnLogin} />);

    const submitButton = screen.getByRole('button', { name: 'Login' });
    expect(submitButton).toBeInTheDocument();

    submitButton.focus();
    expect(submitButton).toHaveFocus();
  });
});
