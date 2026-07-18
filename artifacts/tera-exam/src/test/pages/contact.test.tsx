import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Contact from "../../pages/public/contact";

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("Contact page", () => {
  it("renders the heading", () => {
    renderWithQuery(<Contact />);
    expect(screen.getByRole("heading", { name: /contact us/i })).toBeInTheDocument();
  });

  it("renders Name, Email and Message fields", () => {
    renderWithQuery(<Contact />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it("renders the Send Message button", () => {
    renderWithQuery(<Contact />);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("shows email contact info", () => {
    renderWithQuery(<Contact />);
    expect(screen.getByText(/support@teraexam\.in/i)).toBeInTheDocument();
  });

  it("allows typing in all form fields", async () => {
    const user = userEvent.setup();
    renderWithQuery(<Contact />);

    await user.type(screen.getByLabelText(/your name/i), "Rahul Sharma");
    await user.type(screen.getByLabelText(/email address/i), "rahul@test.com");
    await user.type(screen.getByLabelText(/message/i), "Test message");

    expect(screen.getByLabelText(/your name/i)).toHaveValue("Rahul Sharma");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("rahul@test.com");
    expect(screen.getByLabelText(/message/i)).toHaveValue("Test message");
  });
});
