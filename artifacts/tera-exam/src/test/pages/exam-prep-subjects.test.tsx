import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as apiClient from "@workspace/api-client-react";
import ExamPrepSubjects from "../../pages/public/exam-prep-subjects";

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("ExamPrepSubjects page", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the Exam Prep Zone heading", () => {
    wrap(<ExamPrepSubjects />);
    expect(screen.getByRole("heading", { name: /exam prep zone/i })).toBeInTheDocument();
  });

  it("shows skeleton loading when fetching", () => {
    vi.mocked(apiClient.useListSubjects).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof apiClient.useListSubjects>);
    wrap(<ExamPrepSubjects />);
    expect(document.querySelector("[aria-busy='true']")).toBeInTheDocument();
  });

  it("shows empty state when no subjects", () => {
    vi.mocked(apiClient.useListSubjects).mockReturnValue({
      data: [],
      isLoading: false,
    } as ReturnType<typeof apiClient.useListSubjects>);
    wrap(<ExamPrepSubjects />);
    expect(screen.getByText(/no subjects available/i)).toBeInTheDocument();
  });

  it("renders subject cards when data is available", () => {
    vi.mocked(apiClient.useListSubjects).mockReturnValue({
      data: [
        { id: 1, name: "Quantitative Aptitude", slug: "quant", createdAt: new Date() },
        { id: 2, name: "General Awareness", slug: "ga", createdAt: new Date() },
      ],
      isLoading: false,
    } as ReturnType<typeof apiClient.useListSubjects>);

    wrap(<ExamPrepSubjects />);
    expect(screen.getByText("Quantitative Aptitude")).toBeInTheDocument();
    expect(screen.getByText("General Awareness")).toBeInTheDocument();
  });

  it("subject cards link to the correct topic pages", () => {
    vi.mocked(apiClient.useListSubjects).mockReturnValue({
      data: [{ id: 5, name: "Reasoning", slug: "reasoning", createdAt: new Date() }],
      isLoading: false,
    } as ReturnType<typeof apiClient.useListSubjects>);

    wrap(<ExamPrepSubjects />);
    const link = screen.getByRole("link", { name: /reasoning/i });
    expect(link).toHaveAttribute("href", "/exam-prep/5");
  });
});
