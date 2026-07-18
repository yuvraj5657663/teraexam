import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as apiClient from "@workspace/api-client-react";
import JobsList from "../../pages/public/jobs-list";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("JobsList page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the page heading", () => {
    renderWithQuery(<JobsList />);
    expect(screen.getByRole("heading", { name: /latest govt jobs/i })).toBeInTheDocument();
  });

  it("renders the search input", () => {
    renderWithQuery(<JobsList />);
    expect(screen.getByRole("textbox", { name: /search jobs/i })).toBeInTheDocument();
  });

  it("shows skeleton loading state", () => {
    vi.mocked(apiClient.useListJobs).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof apiClient.useListJobs>);

    renderWithQuery(<JobsList />);
    // Skeleton elements should be present (via aria-busy)
    expect(screen.getByRole("region", { hidden: true }) ?? document.querySelector("[aria-busy='true']")).toBeTruthy();
  });

  it("shows empty state when no jobs", () => {
    vi.mocked(apiClient.useListJobs).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof apiClient.useListJobs>);

    renderWithQuery(<JobsList />);
    expect(screen.getByText(/no jobs found/i)).toBeInTheDocument();
  });

  it("renders job cards when data is available", () => {
    const mockJobs = [
      {
        id: 1,
        title: "SSC CGL 2026",
        organization: "SSC",
        examName: "SSC CGL",
        postDate: new Date("2026-07-01"),
        lastDate: new Date("2026-08-01"),
        status: "published" as const,
        slug: "ssc-cgl-2026",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.mocked(apiClient.useListJobs).mockReturnValue({
      data: mockJobs,
      isLoading: false,
    } as ReturnType<typeof apiClient.useListJobs>);

    renderWithQuery(<JobsList />);
    expect(screen.getByText("SSC CGL 2026")).toBeInTheDocument();
    expect(screen.getByText("SSC")).toBeInTheDocument();
  });

  it("updates search input when user types", async () => {
    const user = userEvent.setup();
    renderWithQuery(<JobsList />);

    const searchInput = screen.getByRole("textbox", { name: /search jobs/i });
    await user.type(searchInput, "UPSC");
    expect(searchInput).toHaveValue("UPSC");
  });

  it("shows helpful description", () => {
    renderWithQuery(<JobsList />);
    expect(screen.getByText(/verified recruitment notifications/i)).toBeInTheDocument();
  });
});
