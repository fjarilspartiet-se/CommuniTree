// src/utils/apiErrorHandler.js

/**
 * Standard error codes for the application
 */
export const ErrorCodes = {
  // Authentication Errors
  INVALID_CREDENTIALS: 'AUTH001',
  TOKEN_EXPIRED: 'AUTH002',
  UNAUTHORIZED: 'AUTH003',
  
  // Resource Errors
  NOT_FOUND: 'RES001',
  ALREADY_EXISTS: 'RES002',
  CONFLICT: 'RES003',
  
  // Validation Errors
  INVALID_INPUT: 'VAL001',
  MISSING_REQUIRED: 'VAL002',
  
  // Server Errors
  INTERNAL_ERROR: 'SRV001',
  SERVICE_UNAVAILABLE: 'SRV002',
  DATABASE_ERROR: 'SRV003',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RAT001',
  
  // File Operations
  FILE_TOO_LARGE: 'FIL001',
  INVALID_FILE_TYPE: 'FIL002',
  
  // Network Errors
  NETWORK_ERROR: 'NET001',
  TIMEOUT: 'NET002'
};

/**
 * Maps HTTP status codes to error codes
 */
const statusToErrorCode = {
  400: ErrorCodes.INVALID_INPUT,
  401: ErrorCodes.UNAUTHORIZED,
  403: ErrorCodes.UNAUTHORIZED,
  404: ErrorCodes.NOT_FOUND,
  409: ErrorCodes.CONFLICT,
  429: ErrorCodes.RATE_LIMIT_EXCEEDED,
  500: ErrorCodes.INTERNAL_ERROR,
  503: ErrorCodes.SERVICE_UNAVAILABLE
};

/**
 * Determines if an error is recoverable (can be retried)
 */
const isRecoverableError = (code) => {
  const recoverableCodes = [
    ErrorCodes.NETWORK_ERROR,
    ErrorCodes.TIMEOUT,
    ErrorCodes.SERVICE_UNAVAILABLE
  ];
  return recoverableCodes.includes(code);
};

/**
 * Creates a standardized error response
 */
export const createErrorResponse = (error, defaultMessage = 'An unexpected error occurred') => {
  const timestamp = new Date().toISOString();
  const errorCode = error.response?.status 
    ? statusToErrorCode[error.response.status]
    : ErrorCodes.INTERNAL_ERROR;

  return {
    code: errorCode,
    message: error.response?.data?.message || defaultMessage,
    details: error.response?.data?.details || {},
    recoverable: isRecoverableError(errorCode),
    timestamp,
    status: error.response?.status || 500
  };
};

/**
 * Handles API errors with automatic retry for recoverable errors
 */
export const handleApiError = async (error, retryFn, maxRetries = 3) => {
  const errorResponse = createErrorResponse(error);
  
  // Log error
  console.error('API Error:', {
    ...errorResponse,
    stack: error.stack
  });

  // If error is recoverable and we have retries left, attempt retry
  if (errorResponse.recoverable && maxRetries > 0) {
    const retryDelay = Math.min(1000 * (2 ** (3 - maxRetries)), 10000);
    
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    
    try {
      return await retryFn();
    } catch (retryError) {
      return handleApiError(retryError, retryFn, maxRetries - 1);
    }
  }

  return errorResponse;
};

/**
 * Error handler HOC for async functions
 */
export const withErrorHandler = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    return handleApiError(error, () => fn(...args));
  }
};

/**
 * Custom hook for handling API errors in components
 */
export const useApiErrorHandler = (defaultMessage) => {
  const handleError = (error) => {
    return createErrorResponse(error, defaultMessage);
  };

  return {
    handleError,
    isRecoverableError
  };
};
