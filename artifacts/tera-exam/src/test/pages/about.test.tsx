import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "../../pages/public/about";

describe("About page", () => {
  it("renders the main heading", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: /about tera exam/i })).toBeInTheDocument();
  });

  it("renders the mission section", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: /our mission/i })).toBeInTheDocument();
  });

  it("renders the Why Choose Us section", () => {
    render(<About />);
    expect(screen.getByRole("heading", { name: /why choose us/i })).toBeInTheDocument();
  });

  it("shows the disclaimer section", () => {
    render(<About />);
    expect(screen.getByText(/disclaimer/i)).toBeInTheDocument();
  });

  it("mentions key features", () => {
    render(<About />);
    expect(screen.getByText(/real-time updates/i)).toBeInTheDocument();
    expect(screen.getByText(/verified information/i)).toBeInTheDocument();
    expect(screen.getByText(/exam-focused practice/i)).toBeInTheDocument();
  });
});
