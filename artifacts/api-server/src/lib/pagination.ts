import type { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Extract and validate pagination params from an Express request.
 */
export function parsePagination(req: Request): PaginationParams {
  const rawPage = req.query["page"];
  const rawLimit = req.query["limit"];

  const parsedPage = Number(rawPage);
  const parsedLimit = Number(rawLimit);

  const page = Math.max(1, Number.isFinite(parsedPage) ? Math.floor(parsedPage) : DEFAULT_PAGE);
  const limit = Math.max(
    1,
    Math.min(
      MAX_LIMIT,
      Number.isFinite(parsedLimit) ? Math.floor(parsedLimit) : DEFAULT_LIMIT,
    ),
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Wrap a result array into a paginated response envelope.
 */
export function paginate<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / params.limit);
  return {
    data,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    },
  };
}
