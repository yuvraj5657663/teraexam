import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NotFound } from "../../pages/not-found";

describe("NotFound page", () => {
  it("renders 404 heading", () => {
    render(<NotFound />);
    expect(screen.getByText("Page Not Found")).toBeInTheDocument();
  });

  it("renders Go to Home button", () => {
    render(<NotFound />);
    expect(screen.getByRole("link", { name: /go to home/i })).toBeInTheDocument();
  });

  it("renders Go Back button", () => {
    render(<NotFound />);
    expect(screen.getByRole("button", { name: /go back/i })).toBeInTheDocument();
  });

  it("shows helpful message about the missing page", () => {
    render(<NotFound />);
    expect(screen.getByText(/moved, removed, or doesn't exist/i)).toBeInTheDocument();
  });

  it("home link points to /", () => {
    render(<NotFound />);
    const homeLink = screen.getByRole("link", { name: /go to home/i });
    expect(homeLink).toHaveAttribute("href", "/");
  });
});
