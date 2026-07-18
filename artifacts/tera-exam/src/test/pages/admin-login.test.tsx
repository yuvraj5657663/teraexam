import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as apiClient from "@workspace/api-client-react";
import AdminLogin from "../../pages/admin/login";

function wrap(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("AdminLogin page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the login form", () => {
    wrap(<AdminLogin />);
    expect(screen.getByText(/authentication required/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login to portal/i })).toBeInTheDocument();
  });

  it("renders TERA EXAM branding", () => {
    wrap(<AdminLogin />);
    expect(screen.getByText(/tera exam/i)).toBeInTheDocument();
    expect(screen.getByText(/secure admin portal/i)).toBeInTheDocument();
  });

  it("shows validation error when submitting empty form", async () => {
    const user = userEvent.setup();
    wrap(<AdminLogin />);
    await user.click(screen.getByRole("button", { name: /login to portal/i }));
    expect(await screen.findByText(/username is required/i)).toBeInTheDocument();
  });

  it("shows validation error when password is empty", async () => {
    const user = userEvent.setup();
    wrap(<AdminLogin />);
    await user.type(screen.getByLabelText(/username/i), "admin");
    await user.click(screen.getByRole("button", { name: /login to portal/i }));
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it("disables submit button while pending", () => {
    vi.mocked(apiClient.useLogin).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof apiClient.useLogin>);

    wrap(<AdminLogin />);
    const btn = screen.getByRole("button", { name: /authenticating/i });
    expect(btn).toBeDisabled();
  });

  it("shows error message on login failure", async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn((_data: unknown, options: { onError: () => void }) => {
      options.onError();
    });
    vi.mocked(apiClient.useLogin).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof apiClient.useLogin>);

    wrap(<AdminLogin />);
    await user.type(screen.getByLabelText(/username/i), "admin");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /login to portal/i }));
    expect(await screen.findByText(/invalid username or password/i)).toBeInTheDocument();
  });
});
