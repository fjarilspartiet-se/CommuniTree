import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommunity } from '../contexts/CommunityContext';
import { useError } from '../contexts/ErrorContext';
import { useAuth } from '../contexts/AuthContext';
import api, { isNetworkError, ErrorCodes } from '../api';
import { formatProjectStatus, filterProjects, sortProjects } from '../utils/projectUtils';
import {
  Box,
  Button,
  Input,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  Heading,
  Text,
  Flex,
  Badge,
  HStack,
  useToast,
  Skeleton,
  Fade
} from '@chakra-ui/react';

function ProjectList({ 
  initialFilter,
  initialSort = 'date',
  pageSize = 10,
  showSearch = true,
  showFilters = true,
  showCreateButton = true,
  onProjectSelect,
  containerStyle = {},
  listStyle = {}
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showError } = useError();
  const { activeCommunities } = useCommunity();
  const toast = useToast();

  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [skillsFilter, setSkillsFilter] = useState('');
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep track of request cancellation
  const abortController = new AbortController();

  const fetchProjects = useCallback(async (page, searchTerm, filterTerm, skills, isRefresh = false) => {
    if (!isRefresh && !hasMore && page > 1) return;

    try {
      setError(null);
      if (!isRefresh) {
        setLoading(true);
      }

      if (activeCommunities.length === 0) {
        setProjects([]);
        setHasMore(false);
        return;
      }

      const communityIds = activeCommunities.map(c => c.id).join(',');
      const queryParams = new URLSearchParams({
        page,
        limit: pageSize,
        search: searchTerm,
        filter: filterTerm,
        communities: communityIds,
        skills: skills
      });

      const data = await api.get(`/projects?${queryParams}`, {
        signal: abortController.signal
      });

      if (isRefresh || page === 1) {
        setProjects(data.projects);
      } else {
        setProjects(prev => [...prev, ...data.projects]);
      }
      
      setHasMore(data.projects.length === pageSize);

      // Show success toast for refresh
      if (isRefresh) {
        toast({
          title: t('projectList.refreshSuccess'),
          status: 'success',
          duration: 2000
        });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled
      }

      setError(error);
      handleError(error);
    } finally {
      setLoading(false);
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  }, [activeCommunities, hasMore, pageSize, toast, t]);

  const handleError = (error) => {
    if (isNetworkError(error)) {
      setError(t('projectList.networkError'));
      toast({
        title: t('projectList.networkError'),
        description: t('projectList.retryMessage'),
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } else if (error.code === ErrorCodes.UNAUTHORIZED) {
      setError(t('projectList.unauthorized'));
    } else {
      setError(t(`errors.${error.code}`, { defaultValue: t('projectList.fetchError') }));
    }
  };

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleFilter = useCallback((value) => {
    setFilter(value);
    setPage(1);
  }, []);

  const handleSkillsFilter = useCallback((value) => {
    setSkillsFilter(value);
    setPage(1);
  }, []);

  const handleSort = useCallback((value) => {
    setSortBy(value);
    const sortedProjects = sortProjects([...projects], value);
    setProjects(sortedProjects);
  }, [projects]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjects(1, search, filter, skillsFilter, true);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProjects(nextPage, search, filter, skillsFilter);
  };

  useEffect(() => {
    fetchProjects(1, search, filter, skillsFilter);

    return () => {
      abortController.abort();
    };
  }, [search, filter, skillsFilter, activeCommunities]);

  const filteredProjects = filterProjects(projects, {
    searchTerm: search,
    status: filter,
    skills: skillsFilter.split(',').map(s => s.trim()).filter(Boolean)
  });

  const renderError = () => (
    <Alert status="error" mb={4}>
      <AlertIcon />
      <Box>
        <AlertTitle>{t('projectList.errorTitle')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Box>
      <Button ml={4} onClick={handleRefresh}>
        {t('projectList.retry')}
      </Button>
    </Alert>
  );

  const renderEmptyState = () => (
    <Box textAlign="center" py={10}>
      <Text fontSize="xl" mb={4}>
        {activeCommunities.length === 0 
          ? t('projectList.selectCommunity')
          : t('projectList.noProjects')}
      </Text>
      {showCreateButton && activeCommunities.length > 0 && (
        <Button as={Link} to="/projects/new" colorScheme="blue">
          {t('projectList.createFirst')}
        </Button>
      )}
    </Box>
  );

  const renderProjectCard = (project) => (
    <Box
      key={project.id}
      borderWidth={1}
      borderRadius="lg"
      p={4}
      _hover={{ shadow: 'md' }}
      onClick={() => onProjectSelect?.(project)}
      cursor={onProjectSelect ? 'pointer' : 'default'}
    >
      <Flex justify="space-between" align="start">
        <Box>
          <Heading as="h3" size="md">{project.title}</Heading>
          <HStack spacing={2} mt={2}>
            <Badge colorScheme={
              project.status === 'open' ? 'green' : 
              project.status === 'in_progress' ? 'blue' : 'gray'
            }>
              {formatProjectStatus(project.status)}
            </Badge>
            {project.community_id && (
              <Badge colorScheme="purple">
                {activeCommunities.find(c => c.id === project.community_id)?.name}
              </Badge>
            )}
          </HStack>
          <Text mt={2} noOfLines={2}>{project.description}</Text>
          {project.required_skills?.length > 0 && (
            <HStack mt={2} spacing={2}>
              {project.required_skills.map((skill, index) => (
                <Badge key={index} colorScheme="cyan">{skill}</Badge>
              ))}
            </HStack>
          )}
        </Box>
        <Button
          as={Link}
          to={`/projects/${project.id}`}
          variant="ghost"
          colorScheme="blue"
          size="sm"
        >
          {t('projectList.viewDetails')}
        </Button>
      </Flex>
    </Box>
  );

  return (
    <Box sx={containerStyle}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="xl">{t('projectList.title')}</Heading>
        <HStack spacing={4}>
          <Button
            onClick={handleRefresh}
            isLoading={isRefreshing}
            variant="ghost"
          >
            {t('projectList.refresh')}
          </Button>
          {showCreateButton && (
            <Button as={Link} to="/projects/new" colorScheme="blue">
              {t('projectList.createNew')}
            </Button>
          )}
        </HStack>
      </Flex>

      {error && renderError()}

      {showSearch || showFilters ? (
        <Flex mb={4} gap={4}>
          {showSearch && (
            <Input
              placeholder={t('projectList.searchPlaceholder')}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              flex={1}
            />
          )}
          {showFilters && (
            <>
              <Select
                value={filter}
                onChange={(e) => handleFilter(e.target.value)}
                w="200px"
              >
                <option value="">{t('projectList.filterAll')}</option>
                <option value="open">{t('projectList.filterOpen')}</option>
                <option value="in_progress">
                  {t('projectList.filterInProgress')}
                </option>
                <option value="completed">
                  {t('projectList.filterCompleted')}
                </option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                w="200px"
              >
                <option value="date">{t('projectList.sortDate')}</option>
                <option value="status">{t('projectList.sortStatus')}</option>
              </Select>
            </>
          )}
        </Flex>
      )}

      <Input
        placeholder={t('projectList.skillsFilterPlaceholder')}
        value={skillsFilter}
        onChange={(e) => handleSkillsFilter(e.target.value)}
        mb={4}
      />

      <VStack spacing={4} align="stretch" sx={listStyle}>
        {loading && page === 1 ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} height="200px" />
          ))
        ) : filteredProjects.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <Fade in={!loading}>
              {filteredProjects.map(project => renderProjectCard(project))}
            </Fade>
            
            {hasMore && !loading && (
              <Button
                onClick={loadMore}
                mt={4}
                mx="auto"
                display="block"
                colorScheme="blue"
                variant="outline"
              >
                {t('projectList.loadMore')}
              </Button>
            )}

            {loading && page > 1 && (
              <Skeleton height="200px" />
            )}
          </>
        )}
      </VStack>
    </Box>
  );
}

ProjectList.propTypes = {
  initialFilter: PropTypes.string,
  initialSort: PropTypes.oneOf(['date', 'status', 'title']),
  pageSize: PropTypes.number,
  showSearch: PropTypes.bool,
  showFilters: PropTypes.bool,
  showCreateButton: PropTypes.bool,
  onProjectSelect: PropTypes.func,
  containerStyle: PropTypes.object,
  listStyle: PropTypes.object
};

ProjectList.defaultProps = {
  initialFilter: '',
  initialSort: 'date',
  pageSize: 10,
  showSearch: true,
  showFilters: true,
  showCreateButton: true,
  containerStyle: {},
  listStyle: {}
};

export default ProjectList;
