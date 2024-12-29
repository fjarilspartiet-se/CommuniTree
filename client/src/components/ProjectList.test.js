import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { I18nextProvider } from 'react-i18next';
import { CommunityProvider } from '../contexts/CommunityContext';
import { ErrorProvider } from '../contexts/ErrorContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ErrorCodes } from '../utils/apiErrorHandler';
import i18n from '../i18n';
import ProjectList from './ProjectList';
import api from '../api';

// Mock API
jest.mock('../api');

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

// Mock active communities
const mockActiveCommunities = [
  { id: 1, name: 'Community 1' },
  { id: 2, name: 'Community 2' }
];

jest.mock('../contexts/CommunityContext', () => ({
  useCommunity: () => ({
    activeCommunities: mockActiveCommunities
  }),
  CommunityProvider: ({ children }) => <div>{children}</div>
}));

// Mock auth context
const mockUser = { id: 1, token: 'mock-token' };
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Sample projects data
const mockProjects = {
  projects: [
    {
      id: 1,
      title: 'Test Project 1',
      description: 'Description 1',
      status: 'open',
      community_id: 1,
      required_skills: ['React', 'Node.js']
    },
    {
      id: 2,
      title: 'Test Project 2',
      description: 'Description 2',
      status: 'in_progress',
      community_id: 2,
      required_skills: ['Python', 'Django']
    }
  ],
  hasMore: true,
  total: 2
};

const renderProjectList = (props = {}) => {
  return render(
    <BrowserRouter>
      <ChakraProvider>
        <I18nextProvider i18n={i18n}>
          <AuthProvider>
            <ErrorProvider>
              <CommunityProvider>
                <ProjectList {...props} />
              </CommunityProvider>
            </ErrorProvider>
          </AuthProvider>
        </I18nextProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
};

describe('ProjectList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    api.get.mockReset();
  });

  test('renders loading state initially', async () => {
    api.get.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    renderProjectList();
    
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3);
  });

  test('renders projects after loading', async () => {
    api.get.mockResolvedValueOnce(mockProjects);
    renderProjectList();

    await waitFor(() => {
      mockProjects.projects.forEach(project => {
        expect(screen.getByText(project.title)).toBeInTheDocument();
        expect(screen.getByText(project.description)).toBeInTheDocument();
      });
    });
  });

  test('handles empty project list', async () => {
    api.get.mockResolvedValueOnce({ projects: [], hasMore: false, total: 0 });
    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/no projects/i)).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    api.get.mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR });
    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  test('handles retry after error', async () => {
    api.get.mockRejectedValueOnce({ code: ErrorCodes.NETWORK_ERROR })
       .mockResolvedValueOnce(mockProjects);
    
    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      mockProjects.projects.forEach(project => {
        expect(screen.getByText(project.title)).toBeInTheDocument();
      });
    });
  });

  test('handles search functionality', async () => {
    api.get.mockResolvedValueOnce(mockProjects);
    renderProjectList();

    const searchInput = await screen.findByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'Test Project 1' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('search=Test%20Project%201'),
        expect.any(Object)
      );
    });
  });

  test('handles filter functionality', async () => {
    api.get.mockResolvedValueOnce(mockProjects);
    renderProjectList();

    const filterSelect = await screen.findByRole('combobox');
    fireEvent.change(filterSelect, { target: { value: 'open' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('filter=open'),
        expect.any(Object)
      );
    });
  });

  test('handles skills filter', async () => {
    api.get.mockResolvedValueOnce(mockProjects);
    renderProjectList();

    const skillsInput = screen.getByPlaceholderText(/skills/i);
    fireEvent.change(skillsInput, { target: { value: 'React,Node.js' } });

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        expect.stringContaining('skills=React%2CNode.js'),
        expect.any(Object)
      );
    });
  });

  test('handles load more functionality', async () => {
    api.get
      .mockResolvedValueOnce(mockProjects)
      .mockResolvedValueOnce({
        projects: [{ id: 3, title: 'Test Project 3', description: 'Description 3' }],
        hasMore: false,
        total: 3
      });

    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/load more/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/load more/i));

    await waitFor(() => {
      expect(screen.getByText('Test Project 3')).toBeInTheDocument();
      expect(screen.queryByText(/load more/i)).not.toBeInTheDocument();
    });
  });

  test('handles refresh functionality', async () => {
    api.get
      .mockResolvedValueOnce(mockProjects)
      .mockResolvedValueOnce(mockProjects);

    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/refresh/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/refresh/i));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
          title: expect.stringMatching(/refresh success/i)
        })
      );
    });
  });

  test('handles unauthorized error', async () => {
    api.get.mockRejectedValueOnce({ code: ErrorCodes.UNAUTHORIZED });
    renderProjectList();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
    });
  });

  test('handles request cancellation', async () => {
    const mockAbort = jest.fn();
    const mockAbortController = { abort: mockAbort, signal: 'mock-signal' };
    global.AbortController = jest.fn(() => mockAbortController);

    renderProjectList();

    // Component unmount
    await act(async () => {
      cleanup();
    });

    expect(mockAbort).toHaveBeenCalled();
  });

  test('handles language switching', async () => {
    api.get.mockResolvedValueOnce(mockProjects);
    renderProjectList();

    // Change language to Swedish
    await i18n.changeLanguage('sv');
    
    expect(screen.getByText(/projekt/i)).toBeInTheDocument();
    expect(screen.getByText(/skapa ny/i)).toBeInTheDocument();
    
    // Change back to English
    await i18n.changeLanguage('en');
    
    expect(screen.getByText(/projects/i)).toBeInTheDocument();
    expect(screen.getByText(/create new/i)).toBeInTheDocument();
  });
});
