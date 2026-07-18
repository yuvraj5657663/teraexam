import { describe, it, expect } from "vitest";
import { toDateOnlyString, withDateStrings } from "../../lib/dates";

describe("toDateOnlyString", () => {
  it("converts a Date to YYYY-MM-DD string", () => {
    const date = new Date("2026-07-15T10:30:00.000Z");
    expect(toDateOnlyString(date)).toBe("2026-07-15");
  });

  it("handles midnight UTC correctly", () => {
    const date = new Date("2026-01-01T00:00:00.000Z");
    expect(toDateOnlyString(date)).toBe("2026-01-01");
  });
});

describe("withDateStrings", () => {
  it("converts specified Date fields to date strings", () => {
    const input = {
      title: "Test Job",
      postDate: new Date("2026-07-15T00:00:00.000Z"),
      lastDate: new Date("2026-08-15T00:00:00.000Z"),
      status: "draft" as const,
    };

    const result = withDateStrings(input, ["postDate", "lastDate"]);
    expect(result.postDate).toBe("2026-07-15");
    expect(result.lastDate).toBe("2026-08-15");
    expect(result.title).toBe("Test Job");
    expect(result.status).toBe("draft");
  });

  it("passes null through unchanged", () => {
    const input = { postDate: new Date("2026-07-15T00:00:00.000Z"), lastDate: null };
    const result = withDateStrings(input, ["postDate", "lastDate"]);
    expect(result.postDate).toBe("2026-07-15");
    expect(result.lastDate).toBeNull();
  });

  it("passes undefined through unchanged", () => {
    const input = { postDate: new Date("2026-07-15T00:00:00.000Z"), lastDate: undefined };
    const result = withDateStrings(input, ["postDate", "lastDate"]);
    expect(result.lastDate).toBeUndefined();
  });

  it("does not mutate the original object", () => {
    const original = { postDate: new Date("2026-07-15T00:00:00.000Z") };
    withDateStrings(original, ["postDate"]);
    expect(original.postDate).toBeInstanceOf(Date);
  });
});
