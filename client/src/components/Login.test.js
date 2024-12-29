import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../contexts/AuthContext';
import i18n from '../i18n';
import Login from './Login';
import { ErrorCodes } from '../utils/apiErrorHandler';

// Mock navigation
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

// Mock toast
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast,
}));

// Mock authentication
const mockLogin = jest.fn();
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

const renderLoginWithProviders = (props = {}) => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <Login {...props} />
          </AuthProvider>
        </I18nextProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  const validCredentials = {
    email: 'test@example.com',
    password: 'Password123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
    // Reset failed attempts in component
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders login form with all elements', () => {
    renderLoginWithProviders();

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    expect(screen.getByText(/no account/i)).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    renderLoginWithProviders();
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    fireEvent.change(emailInput, { target: { value: validCredentials.email } });
    fireEvent.change(passwordInput, { target: { value: validCredentials.password } });

    mockLogin.mockResolvedValueOnce();
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        validCredentials.email,
        validCredentials.password
      );
      expect(mockedNavigate).toHaveBeenCalledWith('/dashboard');
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success'
        })
      );
    });
  });

  test('handles invalid credentials', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    mockLogin.mockRejectedValueOnce({ 
      code: ErrorCodes.INVALID_CREDENTIALS 
    });

    fireEvent.change(emailInput, { target: { value: validCredentials.email } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  test('implements rate limiting after max failed attempts', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Simulate 5 failed login attempts
    mockLogin.mockRejectedValue({ code: ErrorCodes.INVALID_CREDENTIALS });

    for (let i = 0; i < 5; i++) {
      fireEvent.change(emailInput, { target: { value: validCredentials.email } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    }

    // Verify account is locked
    expect(await screen.findByText(/too many attempts/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Fast-forward past lockout period
    act(() => {
      jest.advanceTimersByTime(15 * 60 * 1000);
    });

    // Verify account is unlocked
    expect(submitButton).not.toBeDisabled();
  });

  test('handles network errors', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    mockLogin.mockRejectedValueOnce({ 
      code: ErrorCodes.NETWORK_ERROR 
    });

    fireEvent.change(emailInput, { target: { value: validCredentials.email } });
    fireEvent.change(passwordInput, { target: { value: validCredentials.password } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/network error/i)).toBeInTheDocument();
  });

  test('handles server errors', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    mockLogin.mockRejectedValueOnce({ 
      code: ErrorCodes.SERVICE_UNAVAILABLE 
    });

    fireEvent.change(emailInput, { target: { value: validCredentials.email } });
    fireEvent.change(passwordInput, { target: { value: validCredentials.password } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: expect.stringMatching(/service unavailable/i)
        })
      );
    });
  });

  test('clears error messages when user types', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    // Trigger validation error
    fireEvent.click(submitButton);
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();

    // Start typing
    fireEvent.change(emailInput, { target: { value: 'a' } });
    expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
  });

  test('handles language switching', async () => {
    renderLoginWithProviders();
    
    // Change language to Swedish
    await i18n.changeLanguage('sv');
    
    expect(screen.getByRole('button', { name: /logga in/i })).toBeInTheDocument();
    expect(screen.getByText(/inget konto/i)).toBeInTheDocument();
    
    // Change back to English
    await i18n.changeLanguage('en');
    
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    expect(screen.getByText(/no account/i)).toBeInTheDocument();
  });

  test('shows loading state during submission', async () => {
    renderLoginWithProviders();
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    mockLogin.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    fireEvent.change(emailInput, { target: { value: validCredentials.email } });
    fireEvent.change(passwordInput, { target: { value: validCredentials.password } });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveAttribute('data-loading', 'true');

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).not.toHaveAttribute('data-loading', 'true');
    });
  });
});
