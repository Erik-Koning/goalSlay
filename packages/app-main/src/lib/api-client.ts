import { toast } from "sonner";

/**
 * Standard API error response from the server
 */
export interface ApiErrorResponse {
  message: string;
  error: string;
  details?: unknown;
}

/**
 * Check if response is an API error
 */
export function isApiError(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    "error" in data
  );
}

/**
 * User-friendly error messages based on error codes
 */
const errorMessages: Record<string, string> = {
  VALIDATION_ERROR: "Please check your input and try again",
  UNAUTHORIZED: "Please sign in to continue",
  FORBIDDEN: "You don't have permission to do this",
  NOT_FOUND: "The requested resource was not found",
  RATE_LIMITED: "Too many requests. Please wait and try again",
  DATABASE_ERROR: "Unable to connect to the server",
  EXTERNAL_SERVICE_ERROR: "Unable to reach external service",
  INTERNAL_ERROR: "Something went wrong. Please try again",
};

/**
 * Show error toast for API errors
 */
export function showApiError(error: ApiErrorResponse, context?: string) {
  const title = context ? `${context} failed` : "Error";
  const description =
    error.message || errorMessages[error.error] || "An unexpected error occurred";

  toast.error(title, {
    description,
    duration: 5000,
  });
}

/**
 * Options for API fetch
 */
export interface ApiFetchOptions extends RequestInit {
  /** Show toast on error (default: true) */
  showErrorToast?: boolean;
  /** Context for error message (e.g., "Loading users") */
  errorContext?: string;
}

/**
 * Typed fetch wrapper with automatic error handling and toast notifications
 *
 * @example
 * // Basic usage
 * const { data, error } = await apiFetch<User[]>('/api/users');
 *
 * // With options
 * const { data, error } = await apiFetch<User>('/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 *   errorContext: 'Creating user',
 * });
 */
export async function apiFetch<T>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<{ data: T | null; error: ApiErrorResponse | null; status: number }> {
  const { showErrorToast = true, errorContext, ...fetchOptions } = options;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const apiError: ApiErrorResponse = isApiError(data)
        ? data
        : {
            message: "An unexpected error occurred",
            error: "INTERNAL_ERROR",
          };

      if (showErrorToast) {
        showApiError(apiError, errorContext);
      }

      return { data: null, error: apiError, status: response.status };
    }

    return { data: data as T, error: null, status: response.status };
  } catch (err) {
    // Network errors, CORS issues, etc.
    const networkError: ApiErrorResponse = {
      message: "Unable to connect to server. Please check your connection.",
      error: "NETWORK_ERROR",
      details: err instanceof Error ? err.message : undefined,
    };

    if (showErrorToast) {
      showApiError(networkError, errorContext);
    }

    return { data: null, error: networkError, status: 0 };
  }
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T>(url: string, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(url, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: ApiFetchOptions) =>
    apiFetch<T>(url, { ...options, method: "DELETE" }),
};
