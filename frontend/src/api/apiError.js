const NETWORK_ERROR =
  "Can't reach the server. Check that the gateway is running, then try again.";
const TIMEOUT_ERROR = 'The server took too long to respond. Try again.';
const SERVER_ERROR = 'Something went wrong on our side. Try again in a moment.';

/** Normalizes Axios and network failures into a readable API error. */
export function toApiError(error) {
  if (error?.isApiError) return error;

  const status = error?.response?.status ?? null;
  const responseData = error?.response?.data;
  const serverMessage =
    typeof responseData?.message === 'string'
      ? responseData.message.trim()
      : '';
  const fieldErrors =
    responseData?.fieldErrors && typeof responseData.fieldErrors === 'object'
      ? responseData.fieldErrors
      : {};
  let message = serverMessage;

  if (!message && ['ECONNABORTED', 'ETIMEDOUT'].includes(error?.code)) {
    message = TIMEOUT_ERROR;
  } else if (!message && !error?.response) {
    message = NETWORK_ERROR;
  } else if (!message && status >= 500) {
    message = SERVER_ERROR;
  } else if (!message && status === 401) {
    message = 'Invalid email or password';
  } else if (!message && status === 409) {
    message = 'This email address is already registered.';
  } else if (!message) {
    message = 'We could not complete that request. Try again.';
  }

  return Object.assign(new Error(message), {
    isApiError: true,
    status,
    message,
    fieldErrors,
  });
}
