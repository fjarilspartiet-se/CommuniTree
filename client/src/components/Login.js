import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import api, { ErrorCodes, isNetworkError } from '../api';
import {
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input,
  VStack, 
  Heading, 
  Text, 
  Link,
  Alert, 
  AlertIcon,
  Divider,
  useToast,
  FormErrorMessage
} from '@chakra-ui/react';

const Login = ({ redirectPath = '/dashboard' }) => {  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Track failed attempts for rate limiting
  const [failedAttempts, setFailedAttempts] = useState(0);
  const MAX_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  const [lockoutEnd, setLockoutEnd] = useState(null);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = t('login.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('login.invalidEmail');
    }
    if (!formData.password) {
      errors.password = t('login.passwordRequired');
    }
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if account is locked out
    if (lockoutEnd && new Date() < new Date(lockoutEnd)) {
      const remainingTime = Math.ceil((new Date(lockoutEnd) - new Date()) / 1000 / 60);
      setError(t('login.accountLocked', { minutes: remainingTime }));
      return;
    }

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await login(formData.email, formData.password);
      
      // Reset failed attempts on successful login
      setFailedAttempts(0);
      setLockoutEnd(null);
      
      // Show success message
      toast({
        title: t('login.success'),
        status: 'success',
        duration: 2000,
        isClosable: true
      });

      // Redirect
      navigate(redirectPath);
    } catch (err) {
      // Handle different types of errors
      if (err.code === ErrorCodes.INVALID_CREDENTIALS) {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        // Check if should lock account
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION);
          setLockoutEnd(lockoutTime);
          setError(t('login.tooManyAttempts', { minutes: LOCKOUT_DURATION / 60000 }));
        } else {
          setError(t('login.invalidCredentials', { 
            remainingAttempts: MAX_ATTEMPTS - newAttempts 
          }));
        }
      } else if (isNetworkError(err)) {
        setError(t('login.networkError'));
      } else {
        setError(t(`errors.${err.code}`, { defaultValue: t('login.error') }));
      }

      // Show error toast for certain types of errors
      if (err.code === ErrorCodes.SERVICE_UNAVAILABLE) {
        toast({
          title: t('login.serviceUnavailable'),
          status: 'error',
          duration: 5000,
          isClosable: true
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <VStack spacing={6}>
        <Heading as="h1" size="xl">
          {t('login.title')}
        </Heading>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!formErrors.email} isRequired>
              <FormLabel>{t('login.email')}</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('login.emailPlaceholder')}
                isDisabled={isSubmitting || !!lockoutEnd}
              />
              <FormErrorMessage>{formErrors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!formErrors.password} isRequired>
              <FormLabel>{t('login.password')}</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login.passwordPlaceholder')}
                isDisabled={isSubmitting || !!lockoutEnd}
              />
              <FormErrorMessage>{formErrors.password}</FormErrorMessage>
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              isLoading={isSubmitting}
              isDisabled={!!lockoutEnd}
              loadingText={t('login.loggingIn')}
            >
              {t('login.submit')}
            </Button>
          </VStack>
        </form>

        <VStack spacing={2} width="100%">
          <Link as={RouterLink} to="/forgot-password" color="blue.500">
            {t('login.forgotPassword')}
          </Link>
          
          <Divider my={4} />
          
          <Text>
            {t('login.noAccount')}{' '}
            <Link as={RouterLink} to="/register" color="blue.500">
              {t('login.registerLink')}
            </Link>
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

Login.propTypes = {
  redirectPath: PropTypes.string,
  onLoginSuccess: PropTypes.func,
  onLoginError: PropTypes.func
};

Login.defaultProps = {
  redirectPath: '/dashboard',
  onLoginSuccess: undefined,
  onLoginError: undefined
};

export default Login;