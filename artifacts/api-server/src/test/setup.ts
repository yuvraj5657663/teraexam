import { vi } from "vitest";

// Set JWT_SECRET globally before any test module imports
process.env["JWT_SECRET"] = "test-jwt-secret-that-is-at-least-32-chars-long!!";
process.env["NODE_ENV"] = "test";

// ---------------------------------------------------------------------------
// DB mock — structured so chained calls resolve properly
// ---------------------------------------------------------------------------
vi.mock("@workspace/db", () => {
  const makeSelectChain = (resolveValue: unknown[] = []) => ({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockImplementation(() => ({
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue(resolveValue),
          }),
        }),
        then: (onfulfilled?: (value: any) => any) => {
          return Promise.resolve(resolveValue).then(onfulfilled);
        },
      })),
      orderBy: vi.fn().mockReturnValue({
        limit: vi.fn().mockReturnValue({
          offset: vi.fn().mockResolvedValue(resolveValue),
        }),
      }),
      then: (onfulfilled?: (value: any) => any) => {
        return Promise.resolve(resolveValue).then(onfulfilled);
      },
    }),
  });

  const mockDb = {
    select: vi.fn(() => makeSelectChain([])),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    }),
  };

  return {
    db: mockDb,
    pool: {
      query: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
      end: vi.fn().mockResolvedValue(undefined),
    },
    adminsTable: {
      id: "id",
      username: "username",
      passwordHash: "password_hash",
      createdAt: "created_at",
    },
    jobsTable: { id: "id", status: "status", title: "title" },
    resultsTable: { id: "id", status: "status" },
    admitCardsTable: { id: "id", status: "status" },
    syllabusTable: { id: "id", status: "status" },
    subjectsTable: { id: "id" },
    topicsTable: { id: "id", subjectId: "subject_id" },
    questionsTable: { id: "id", topicId: "topic_id" },
    scrapedItemsTable: { id: "id", status: "status" },
  };
});
