import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error monitoring service
    this.logError(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  logError = (error, errorInfo) => {
    // TODO: Replace with actual error monitoring service
    console.error('Error caught by boundary:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString(),
      componentStack: errorInfo?.componentStack,
      user: this.props.user?.id, // If user info is available
      location: window.location.href
    });
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  handleReportError = () => {
    // TODO: Implement error reporting functionality
    const errorReport = {
      error: this.state.error?.toString(),
      componentStack: this.state.errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      location: window.location.href
    };

    console.log('Error report:', errorReport);
    // Here we would send the error report to a backend endpoint
  };

  render() {
    const { t } = this.props;
    const { hasError, errorCount } = this.state;

    // If error occurs too many times, show permanent error state
    const tooManyErrors = errorCount >= 3;

    if (hasError) {
      return (
        <Box textAlign="center" py={10} px={6}>
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            height="auto"
            py={8}
            px={6}
            borderRadius="lg"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              {t('errorBoundary.title')}
            </AlertTitle>
            <AlertDescription maxWidth="sm">
              {t('errorBoundary.description')}
            </AlertDescription>

            <VStack mt={6} spacing={4}>
              {!tooManyErrors && (
                <Button
                  leftIcon={<RefreshCcw size={16} />}
                  colorScheme="blue"
                  onClick={this.handleRetry}
                >
                  {t('errorBoundary.retry')}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={this.handleReportError}
              >
                {t('errorBoundary.report')}
              </Button>

              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
              >
                {t('errorBoundary.returnHome')}
              </Button>
            </VStack>

            {tooManyErrors && (
              <Text mt={4} color="red.500">
                {t('errorBoundary.tooManyErrors')}
              </Text>
            )}
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  t: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  onError: PropTypes.func,
  maxRetries: PropTypes.number
};

ErrorBoundary.defaultProps = {
  user: null,
  onError: undefined,
  maxRetries: 3
};

export default withTranslation()(ErrorBoundary);
