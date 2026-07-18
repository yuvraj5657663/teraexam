import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BlogDetail from "../../pages/public/blog-detail";

// Override useRoute to simulate a specific blog id
vi.mock("wouter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("wouter")>();
  return {
    ...actual,
    useRoute: () => [true, { id: "1" }],
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
      <a href={href}>{children}</a>
    ),
  };
});

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient();
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("BlogDetail page", () => {
  it("renders the blog title for id=1", () => {
    wrap(<BlogDetail />);
    expect(screen.getByText(/how to prepare for ssc cgl 2026/i)).toBeInTheDocument();
  });

  it("renders Back to Blogs link", () => {
    wrap(<BlogDetail />);
    expect(screen.getByRole("link", { name: /back to blogs/i })).toBeInTheDocument();
  });

  it("renders the author name", () => {
    wrap(<BlogDetail />);
    expect(screen.getByText(/tera exam editorial/i)).toBeInTheDocument();
  });

  it("renders tags", () => {
    wrap(<BlogDetail />);
    expect(screen.getByText("SSC CGL")).toBeInTheDocument();
  });

  it("renders Share button", () => {
    wrap(<BlogDetail />);
    expect(screen.getByRole("button", { name: /share article/i })).toBeInTheDocument();
  });
});

describe("BlogDetail page — not found", () => {
  beforeEach(() => {
    vi.mock("wouter", async (importOriginal) => {
      const actual = await importOriginal<typeof import("wouter")>();
      return {
        ...actual,
        useRoute: () => [true, { id: "999" }], // non-existent ID
        Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
          <a href={href}>{children}</a>
        ),
      };
    });
  });

  it("shows not found state for invalid blog id", () => {
    wrap(<BlogDetail />);
    // For unknown IDs it shows the not found message
    // The blog for id 999 doesn't exist in BLOGS map
    expect(
      screen.queryByText(/article not found/i) !== null ||
      screen.queryByText(/back to all articles/i) !== null
    ).toBe(true);
  });
});
