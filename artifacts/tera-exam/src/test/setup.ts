import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

// Mock wouter so components don't need a real router
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  useRoute: () => [true, {}],
  useParams: () => ({}),
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    React.createElement("a", { href, ...props }, children)
  ),
  Route: ({ component: Component }: { component: React.ComponentType }) => React.createElement(Component),
  Switch: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  Router: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}));

// Mock the API client so tests don't make real HTTP calls
vi.mock("@workspace/api-client-react", () => ({
  useListJobs: vi.fn(() => ({ data: undefined, isLoading: false })),
  useListResults: vi.fn(() => ({ data: undefined, isLoading: false })),
  useListAdmitCards: vi.fn(() => ({ data: undefined, isLoading: false })),
  useListSyllabus: vi.fn(() => ({ data: undefined, isLoading: false })),
  useListSubjects: vi.fn(() => ({ data: undefined, isLoading: false })),
  useListTopicsBySubject: vi.fn(() => ({ data: undefined, isLoading: false })),
  useListQuestionsByTopic: vi.fn(() => ({ data: [], isLoading: false })),
  useGetJob: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useGetResult: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useGetAdmitCard: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useGetHomeSummary: vi.fn(() => ({ data: undefined, isLoading: false })),
  useLogin: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useGetMe: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useGetAdminDashboardSummary: vi.fn(() => ({ data: undefined, isLoading: false })),
  useAdminListJobs: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListResults: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListAdmitCards: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListSyllabus: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListSubjects: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListTopics: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListQuestions: vi.fn(() => ({ data: [], isLoading: false })),
  useAdminListScrapedItems: vi.fn(() => ({ data: [], isLoading: false })),
  useCreateJob: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateJob: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteJob: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateResult: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateResult: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteResult: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateAdmitCard: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateAdmitCard: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteAdmitCard: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateSyllabus: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateSyllabus: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteSyllabus: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useApproveScrapedItem: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRejectScrapedItem: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useRunScraper: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useSubmitTopicAnswers: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useCreateQuestion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useUpdateQuestion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  useDeleteQuestion: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  setAuthTokenGetter: vi.fn(),
  getGetMeQueryKey: vi.fn(() => ["/api/auth/me"]),
  getAdminListJobsQueryKey: vi.fn(() => ["/api/admin/jobs"]),
  getAdminListResultsQueryKey: vi.fn(() => ["/api/admin/results"]),
  getAdminListAdmitCardsQueryKey: vi.fn(() => ["/api/admin/admit-cards"]),
  getAdminListSyllabusQueryKey: vi.fn(() => ["/api/admin/syllabus"]),
  getAdminListQuestionsQueryKey: vi.fn(() => ["/api/admin/questions"]),
  getAdminListScrapedItemsQueryKey: vi.fn(() => ["/api/admin/scraped-items"]),
  getGetJobQueryKey: vi.fn((id: number) => [`/api/jobs/${id}`]),
  getListTopicsBySubjectQueryKey: vi.fn((id: number) => [`/api/subjects/${id}/topics`]),
  getListQuestionsByTopicQueryKey: vi.fn((id: number) => [`/api/topics/${id}/questions`]),
}));

// Mock tanstack query
vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
    })),
  };
});
