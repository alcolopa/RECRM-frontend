
/**
 * Maps backend validation errors to a record of field-specific error messages.
 * Expects the backend to return a 400 Bad Request with an object mapping properties to constraints.
 */
export const mapBackendErrors = (err: any): Record<string, string> => {
  if (err?.response?.status === 400 && typeof err.response.data === 'object' && !Array.isArray(err.response.data)) {
    const data = err.response.data;
    // NestJS default ValidationPipe returns the error object directly if customized,
    // or sometimes it might be nested in a 'message' or 'errors' field depending on filters.
    // Our custom exceptionFactory returns the object directly as the body of BadRequestException.
    return data as Record<string, string>;
  }
  return {};
};

/**
 * Gets a general error message from an Axios error if it's not a validation error.
 */
export const getErrorMessage = (err: any, defaultMessage: string = 'An unexpected error occurred'): string => {
  if (err?.response?.data?.message) {
    if (Array.isArray(err.response.data.message)) {
      return err.response.data.message[0];
    }
    return err.response.data.message;
  }
  return err?.message || defaultMessage;
};
