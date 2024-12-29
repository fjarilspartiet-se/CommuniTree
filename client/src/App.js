import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorBoundary from './components/ErrorBoundary';
import { useTranslation } from 'react-i18next';
import { ChakraProvider, ColorModeScript, Flex, Box, Spacer } from '@chakra-ui/react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { CommunityProvider } from './contexts/CommunityContext';
import ThemeSwitcher from './components/ThemeSwitcher';
import LanguageSwitcher from './components/LanguageSwitcher';
import CommunitySwitcher from './components/CommunitySwitcher';
import CommunityLanding from './components/CommunityLanding';
import { getTheme } from './theme/locationThemes';
import './App.css';
import UserList from './components/UserList';
import ProjectList from './components/ProjectList';
import ProjectDetails from './components/ProjectDetails';
import CreateProject from './components/CreateProject';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './components/Dashboard';
import EventCalendar from './components/EventCalendar';
import { AuthProvider } from './contexts/AuthContext';
import UserProfile from './components/UserProfile';
import Navigation from './components/Navigation';
import { PermissionProvider } from './contexts/PermissionContext';
import CommunityManagement from './components/communities/CommunityManagement';

// Suspense fallback component
const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner size="xl" />
  </Center>
);

function AppContent() {
  const { t, ready } = useTranslation();
  const theme = useTheme();
  const safeTheme = theme && theme.config ? theme : getTheme('default', 'light');

  if (!ready) return <LoadingFallback />;

  return (
    <ChakraProvider theme={safeTheme}>
      <ColorModeScript initialColorMode={safeTheme.config.initialColorMode} />
      <ErrorProvider>
        <ErrorBoundary>
          <AuthProvider>
            <PermissionProvider>
              <ErrorBoundary>
                <CommunityProvider>
                  <Router>
                    <div className="App">
                      <div className="tree-background"></div>
                      <div className="content-wrapper">
                        {/* Navigation Section */}
                        <ErrorBoundary>
                          <Flex 
                            as="header" 
                            className="App-header" 
                            align="center" 
                            wrap="wrap" 
                            padding="1.5rem"
                            gap={4}
                          >
                            <Box>
                              <h1>{t('appName')}</h1>
                            </Box>
                            <Spacer />
                            <Flex align="center" gap={4}>
                              <CommunitySwitcher />
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                            </Flex>
                          </Flex>
                          <Navigation />
                        </ErrorBoundary>

                        {/* Main Content Section */}
                        <ErrorBoundary>
                          <main>
                            <Routes>
                              {/* Public Routes */}
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route path="/forgot-password" element={<ForgotPassword />} />
                              <Route path="/reset-password/:token" element={<ResetPassword />} />

                              {/* Protected Routes */}
                              <Route element={<PrivateRoute />}>
                                <Route path="/" element={<UserList />} />
                                <Route path="/projects" element={<ProjectList />} />
                                <Route path="/projects/create" element={<CreateProject />} />
                                <Route path="/projects/:id" element={<ProjectDetails />} />
                                <Route path="/profile" element={<UserProfile />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/events" element={<EventCalendar />} />
                                <Route path="/communities/:id" element={<CommunityLanding />} />
                                <Route 
                                  path="/admin/communities" 
                                  element={
                                    <PrivateRoute>
                                      <CommunityManagement />
                                    </PrivateRoute>
                                  } 
                                />
                              </Route>
                            </Routes>
                          </main>
                        </ErrorBoundary>
                      </div>
                    </div>
                  </Router>
                </CommunityProvider>
              </ErrorBoundary>
            </PermissionProvider>
          </AuthProvider>
        </ErrorBoundary>
      </ErrorProvider>
    </ChakraProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </Suspense>
    </ThemeProvider>
  );
}

// PropTypes for App component
App.propTypes = {
  // If needed, add any props that might be passed to App
};

export default App;
