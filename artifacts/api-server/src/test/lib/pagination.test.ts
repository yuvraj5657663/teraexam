import { describe, it, expect } from "vitest";
import { parsePagination, paginate } from "../../lib/pagination";
import type { Request } from "express";

function makeReq(query: Record<string, string> = {}): Request {
  return { query } as unknown as Request;
}

describe("parsePagination", () => {
  it("returns defaults when no query params", () => {
    const result = parsePagination(makeReq());
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(0);
  });

  it("parses valid page and limit", () => {
    const result = parsePagination(makeReq({ page: "3", limit: "10" }));
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.offset).toBe(20); // (3-1) * 10
  });

  it("clamps limit to MAX_LIMIT=100", () => {
    const result = parsePagination(makeReq({ limit: "999" }));
    expect(result.limit).toBe(100);
  });

  it("clamps page to minimum 1", () => {
    const result = parsePagination(makeReq({ page: "-5" }));
    expect(result.page).toBe(1);
  });

  it("clamps limit to minimum 1", () => {
    const result = parsePagination(makeReq({ limit: "0" }));
    expect(result.limit).toBe(1);
  });

  it("handles non-numeric values gracefully", () => {
    const result = parsePagination(makeReq({ page: "abc", limit: "xyz" }));
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });
});

describe("paginate", () => {
  it("calculates correct totalPages", () => {
    const result = paginate([1, 2, 3], 25, { page: 1, limit: 10, offset: 0 });
    expect(result.pagination.totalPages).toBe(3);
    expect(result.pagination.hasNext).toBe(true);
    expect(result.pagination.hasPrev).toBe(false);
  });

  it("sets hasPrev=true when page > 1", () => {
    const result = paginate([1], 25, { page: 2, limit: 10, offset: 10 });
    expect(result.pagination.hasPrev).toBe(true);
  });

  it("sets hasNext=false on last page", () => {
    const result = paginate([1], 10, { page: 1, limit: 10, offset: 0 });
    expect(result.pagination.hasNext).toBe(false);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("returns data unchanged", () => {
    const data = [{ id: 1 }, { id: 2 }];
    const result = paginate(data, 2, { page: 1, limit: 10, offset: 0 });
    expect(result.data).toBe(data);
  });

  it("handles zero total", () => {
    const result = paginate([], 0, { page: 1, limit: 20, offset: 0 });
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
    expect(result.pagination.hasNext).toBe(false);
  });
});
