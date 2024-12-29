import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import api from '../api';
import { ErrorCodes } from '../utils/apiErrorHandler';
import i18n from '../i18n';

// Mock API
jest.mock('../api');

// Mock auth context
const mockUser = { id: 1, token: 'mock-token' };
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Mock toast notifications
const mockToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockToast
}));

// Sample user profile data
const mockProfile = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  bio: 'Test bio',
  skills: ['React', 'Node.js'],
  avatar_url: 'http://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00.000Z'
};

const renderUserProfile = (props = {}) => {
  return render(
    <ChakraProvider>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <UserProfile {...props} />
        </AuthProvider>
      </I18nextProvider>
    </ChakraProvider>
  );
};

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockReset();
    api.put.mockReset();
    api.upload.mockReset();
  });

  test('renders loading state initially', () => {
    api.get.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderUserProfile();
    
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  test('renders user profile after loading', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.skills.join(', '))).toBeInTheDocument();
    });
  });

  test('handles network error when loading profile', async () => {
    api.get.mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR });
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  test('handles edit mode toggle', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue(mockProfile.name);
    expect(screen.getByRole('textbox', { name: /bio/i })).toHaveValue(mockProfile.bio);
  });

  test('validates required fields', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(nameInput, { target: { value: '' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });

  test('handles successful profile update', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    api.put.mockResolvedValueOnce({ ...mockProfile, name: 'Updated Name' });

    const onProfileUpdate = jest.fn();
    renderUserProfile({ onProfileUpdate });

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          title: expect.stringMatching(/update success/i)
        })
      );
      expect(onProfileUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Updated Name' })
      );
    });
  });

  test('handles avatar upload', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    api.upload.mockResolvedValueOnce({ 
      avatar_url: 'http://example.com/new-avatar.jpg' 
    });

    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const input = screen.getByLabelText(/upload avatar/i);
    
    Object.defineProperty(input, 'files', {
      value: [file]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(api.upload).toHaveBeenCalledWith(
        `/users/${mockUser.id}/avatar`,
        file,
        expect.any(Function)
      );
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          title: expect.stringMatching(/avatar.*success/i)
        })
      );
    });
  });

  test('handles invalid file type for avatar', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload avatar/i);
    
    Object.defineProperty(input, 'files', {
      value: [file]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: expect.stringMatching(/invalid file type/i)
        })
      );
    });
  });

  test('handles file size limit for avatar', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { 
      type: 'image/jpeg' 
    });
    const input = screen.getByLabelText(/upload avatar/i);
    
    Object.defineProperty(input, 'files', {
      value: [largeFile]
    });

    fireEvent.change(input);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          title: expect.stringMatching(/file too large/i)
        })
      );
    });
  });

  test('handles custom fields', async () => {
    api.get.mockResolvedValueOnce({
      ...mockProfile,
      customField: 'Custom Value'
    });

    const customFields = [{
      key: 'customField',
      label: 'Custom Field',
      type: 'text',
      required: true
    }];

    renderUserProfile({ customFields });

    await waitFor(() => {
      expect(screen.getByText('Custom Field:')).toBeInTheDocument();
      expect(screen.getByText('Custom Value')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    const customInput = screen.getByLabelText('Custom Field');
    expect(customInput).toHaveValue('Custom Value');
  });

  test('handles custom validation', async () => {
    api.get.mockResolvedValueOnce(mockProfile);

    const customValidation = (data) => {
      const errors = {};
      if (data.bio?.length < 10) {
        errors.bio = 'Bio must be at least 10 characters';
      }
      return errors;
    };

    renderUserProfile({ customValidation });

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    const bioInput = screen.getByRole('textbox', { name: /bio/i });
    fireEvent.change(bioInput, { target: { value: 'Short' } });
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(await screen.findByText(/bio must be at least 10 characters/i))
      .toBeInTheDocument();
  });

  test('handles cancel editing', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    const nameInput = screen.getByRole('textbox', { name: /name/i });
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  test('handles request cancellation on unmount', async () => {
    const mockAbort = jest.fn();
    const mockAbortController = { abort: mockAbort, signal: 'mock-signal' };
    global.AbortController = jest.fn(() => mockAbortController);

    const { unmount } = renderUserProfile();

    unmount();

    expect(mockAbort).toHaveBeenCalled();
  });

  test('handles language switching', async () => {
    api.get.mockResolvedValueOnce(mockProfile);
    renderUserProfile();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.name)).toBeInTheDocument();
    });

    // Change language to Swedish
    await i18n.changeLanguage('sv');
    
    expect(screen.getByText(/redigera/i)).toBeInTheDocument();
    expect(screen.getByText(/medlem sedan/i)).toBeInTheDocument();
    
    // Change back to English
    await i18n.changeLanguage('en');
    
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/member since/i)).toBeInTheDocument();
  });
});
