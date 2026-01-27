import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  message: string;
  error: string;
  details?: unknown;
}

/**
 * Error codes for categorizing errors
 */
export const ErrorCode = {
  // Client errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  BAD_REQUEST: "BAD_REQUEST",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Create a standardized API error response
 */
export function apiError(
  message: string,
  error: ErrorCode,
  status: number,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    message,
    error,
  };

  if (details !== undefined) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Handle and format various error types into a consistent API error response
 */
export function handleApiError(
  error: unknown,
  context: string = "operation"
): NextResponse<ApiErrorResponse> {
  // Zod validation errors
  if (error instanceof z.ZodError) {
    return apiError(
      "Validation failed",
      ErrorCode.VALIDATION_ERROR,
      400,
      error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }))
    );
  }

  // Prisma errors
  if (isPrismaError(error)) {
    console.error(`[${context}] Database error:`, error);

    // Handle specific Prisma error codes
    const prismaError = error as PrismaClientKnownRequestError;

    if (prismaError.code === "P2002") {
      return apiError(
        "A record with this value already exists",
        ErrorCode.VALIDATION_ERROR,
        409,
        { field: prismaError.meta?.target }
      );
    }

    if (prismaError.code === "P2025") {
      return apiError("Record not found", ErrorCode.NOT_FOUND, 404);
    }

    // Connection errors
    if (
      prismaError.message?.includes("Failed to connect") ||
      prismaError.message?.includes("Connection refused") ||
      prismaError.message?.includes("timed out")
    ) {
      return apiError(
        "Unable to connect to database. Please try again later.",
        ErrorCode.DATABASE_ERROR,
        503,
        process.env.NODE_ENV === "development"
          ? { originalError: prismaError.message }
          : undefined
      );
    }

    return apiError(
      "A database error occurred",
      ErrorCode.DATABASE_ERROR,
      500,
      process.env.NODE_ENV === "development"
        ? { code: prismaError.code, message: prismaError.message }
        : undefined
    );
  }

  // Fetch/network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    console.error(`[${context}] Network error:`, error);
    return apiError(
      "Unable to connect to external service",
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      503,
      process.env.NODE_ENV === "development"
        ? { originalError: error.message }
        : undefined
    );
  }

  // Generic Error
  if (error instanceof Error) {
    console.error(`[${context}] Error:`, error);
    return apiError(
      "An unexpected error occurred",
      ErrorCode.INTERNAL_ERROR,
      500,
      process.env.NODE_ENV === "development"
        ? { name: error.name, message: error.message }
        : undefined
    );
  }

  // Unknown error type
  console.error(`[${context}] Unknown error:`, error);
  return apiError(
    "An unexpected error occurred",
    ErrorCode.INTERNAL_ERROR,
    500
  );
}

/**
 * Type guard for Prisma errors
 */
interface PrismaClientKnownRequestError {
  code: string;
  meta?: { target?: string[] };
  message: string;
  name: string;
}

function isPrismaError(error: unknown): error is PrismaClientKnownRequestError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "name" in error &&
    (error as { name: string }).name.includes("Prisma")
  );
}

/**
 * Common error responses
 */
export const commonErrors = {
  unauthorized: () =>
    apiError("Authentication required", ErrorCode.UNAUTHORIZED, 401),

  forbidden: () =>
    apiError("You do not have permission to perform this action", ErrorCode.FORBIDDEN, 403),

  notFound: (resource: string = "Resource") =>
    apiError(`${resource} not found`, ErrorCode.NOT_FOUND, 404),

  badRequest: (message: string, details?: unknown) =>
    apiError(message, ErrorCode.BAD_REQUEST, 400, details),

  rateLimited: (retryAfter?: number) =>
    apiError(
      "Too many requests. Please try again later.",
      ErrorCode.RATE_LIMITED,
      429,
      retryAfter ? { retryAfter } : undefined
    ),
};
