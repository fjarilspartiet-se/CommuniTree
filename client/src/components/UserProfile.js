import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api, { isNetworkError, ErrorCodes } from '../api';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Avatar,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  IconButton,
  HStack,
  Progress,
  Skeleton,
  useDisclosure
} from '@chakra-ui/react';
import { Camera, X } from 'lucide-react';

const UserProfile = ({
  allowEditing = true,
  showBio = true,
  showSkills = true,
  onProfileUpdate,
  customValidation,
  customFields = []
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen: isEditing, onOpen: startEditing, onClose: cancelEditing } = useDisclosure();

  // State management
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [],
    ...customFields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {})
  });

  // Abort controller for cancelling requests
  const abortController = new AbortController();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await api.get(`/users/${user.id}`, {
        signal: abortController.signal
      });

      setProfile(data);
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        skills: data.skills || [],
        ...customFields.reduce((acc, field) => ({
          ...acc,
          [field.key]: data[field.key] || ''
        }), {})
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const handleError = (error) => {
    if (error.name === 'AbortError') return;

    if (isNetworkError(error)) {
      setError({
        title: t('userProfile.networkError'),
        description: t('userProfile.networkErrorDescription')
      });
    } else if (error.code === ErrorCodes.UNAUTHORIZED) {
      setError({
        title: t('userProfile.unauthorized'),
        description: t('userProfile.unauthorizedDescription')
      });
    } else {
      setError({
        title: t('userProfile.error'),
        description: t(`errors.${error.code}`, { 
          defaultValue: t('userProfile.genericError') 
        })
      });
    }

    // Show toast for certain errors
    if (error.code === ErrorCodes.VALIDATION_ERROR) {
      toast({
        title: t('userProfile.validationError'),
        description: t('userProfile.checkFields'),
        status: 'error',
        duration: 5000
      });
    }
  };

  const validateForm = (data) => {
    const errors = {};
    
    if (!data.name?.trim()) {
      errors.name = t('userProfile.nameRequired');
    }

    if (showBio && data.bio?.length > 500) {
      errors.bio = t('userProfile.bioTooLong');
    }

    if (showSkills && data.skills?.length > 10) {
      errors.skills = t('userProfile.tooManySkills');
    }

    // Custom field validation
    customFields.forEach(field => {
      if (field.required && !data[field.key]) {
        errors[field.key] = t('userProfile.fieldRequired', { field: field.label });
      }
      if (field.validate) {
        const fieldError = field.validate(data[field.key]);
        if (fieldError) errors[field.key] = fieldError;
      }
    });

    // Additional custom validation
    if (customValidation) {
      const customErrors = customValidation(data);
      Object.assign(errors, customErrors);
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const updatedProfile = await api.put(`/users/${user.id}`, formData);
      
      setProfile(updatedProfile);
      onProfileUpdate?.(updatedProfile);
      
      toast({
        title: t('userProfile.updateSuccess'),
        status: 'success',
        duration: 3000
      });
      
      cancelEditing();
    } catch (err) {
      handleError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: t('userProfile.fileTooLarge'),
        status: 'error',
        duration: 5000
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('userProfile.invalidFileType'),
        status: 'error',
        duration: 5000
      });
      return;
    }

    try {
      setUploadProgress(0);
      
      const data = await api.upload(`/users/${user.id}/avatar`, file, 
        (progress) => setUploadProgress(progress)
      );
      
      setProfile(prev => ({ ...prev, avatar_url: data.avatar_url }));
      
      toast({
        title: t('userProfile.avatarUpdateSuccess'),
        status: 'success',
        duration: 3000
      });
    } catch (err) {
      handleError(err);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSkillsChange = (value) => {
    const skills = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, skills }));
  };

  useEffect(() => {
    fetchProfile();
    return () => {
      abortController.abort();
    };
  }, [fetchProfile]);

  if (loading) {
    return (
      <Box maxW="2xl" mx="auto" mt={8}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="40px" width="200px" />
          <Skeleton height="200px" />
          <Skeleton height="60px" />
          <Skeleton height="100px" />
        </VStack>
      </Box>
    );
  }

  const renderError = () => (
    <Alert status="error" mb={4}>
      <AlertIcon />
      <Box>
        <AlertTitle>{error.title}</AlertTitle>
        <AlertDescription>{error.description}</AlertDescription>
      </Box>
      <Button ml={4} onClick={fetchProfile}>
        {t('userProfile.retry')}
      </Button>
    </Alert>
  );

  return (
    <Box maxW="2xl" mx="auto" mt={8}>
      {error && renderError()}

      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading as="h2" size="xl">{t('userProfile.title')}</Heading>
          {allowEditing && !isEditing && (
            <Button onClick={startEditing} colorScheme="blue">
              {t('userProfile.edit')}
            </Button>
          )}
        </HStack>

        <Box position="relative">
          <Avatar
            size="2xl"
            src={profile?.avatar_url}
            name={profile?.name}
          />
          {allowEditing && (
            <Box position="absolute" bottom={0} right={0}>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
              <IconButton
                as="label"
                htmlFor="avatar-upload"
                icon={<Camera size={20} />}
                aria-label={t('userProfile.uploadAvatar')}
                colorScheme="blue"
                rounded="full"
                size="sm"
              />
            </Box>
          )}
          {uploadProgress > 0 && (
            <Progress
              value={uploadProgress}
              size="xs"
              colorScheme="blue"
              mt={2}
            />
          )}
        </Box>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isInvalid={!!formErrors.name} isRequired>
                <FormLabel>{t('userProfile.name')}</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              </FormControl>

              {showBio && (
                <FormControl isInvalid={!!formErrors.bio}>
                  <FormLabel>{t('userProfile.bio')}</FormLabel>
                  <Textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                  />
                  <FormErrorMessage>{formErrors.bio}</FormErrorMessage>
                </FormControl>
              )}

              {showSkills && (
                <FormControl isInvalid={!!formErrors.skills}>
                  <FormLabel>{t('userProfile.skills')}</FormLabel>
                  <Input
                    value={formData.skills.join(', ')}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder={t('userProfile.skillsPlaceholder')}
                  />
                  <FormErrorMessage>{formErrors.skills}</FormErrorMessage>
                </FormControl>
              )}

              {customFields.map(field => (
                <FormControl 
                  key={field.key} 
                  isInvalid={!!formErrors[field.key]}
                  isRequired={field.required}
                >
                  <FormLabel>{field.label}</FormLabel>
                  {field.type === 'textarea' ? (
                    <Textarea
                      name={field.key}
                      value={formData[field.key]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <Input
                      type={field.type}
                      name={field.key}
                      value={formData[field.key]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                    />
                  )}
                  <FormErrorMessage>{formErrors[field.key]}</FormErrorMessage>
                </FormControl>
              ))}

              <HStack spacing={4} width="100%" justify="flex-end">
                <Button onClick={cancelEditing} isDisabled={isSubmitting}>
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                >
                  {t('common.save')}
                </Button>
              </HStack>
            </VStack>
          </form>
        ) : (
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold">{t('userProfile.name')}:</Text>
              <Text>{profile.name}</Text>
            </Box>

            {showBio && profile.bio && (
              <Box>
                <Text fontWeight="bold">{t('userProfile.bio')}:</Text>
                <Text>{profile.bio}</Text>
              </Box>
            )}

            {showSkills && profile.skills?.length > 0 && (
              <Box>
                <Text fontWeight="bold">{t('userProfile.skills')}:</Text>
                <Text>{profile.skills.join(', ')}</Text>
              </Box>
            )}

            {customFields.map(field => profile[field.key] && (
              <Box key={field.key}>
                <Text fontWeight="bold">{field.label}:</Text>
                <Text>{profile[field.key]}</Text>
              </Box>
            ))}

            <Box>
              <Text fontWeight="bold">{t('userProfile.memberSince')}:</Text>
              <Text>
                {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

UserProfile.propTypes = {
  // Feature flags
  allowEditing: PropTypes.bool,
  showBio: PropTypes.bool,
  showSkills: PropTypes.bool,

  // Optional callbacks
  onProfileUpdate: PropTypes.func,
  customValidation: PropTypes.func,

  // Custom fields configuration
  customFields: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'textarea', 'email', 'tel', 'url']),
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    validate: PropTypes.func
  }))
};

UserProfile.defaultProps = {
  allowEditing: true,
  showBio: true,
  showSkills: true,
  onProfileUpdate: undefined,
  customValidation: undefined,
  customFields: []
};

export default UserProfile;
