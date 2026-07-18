import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Privacy from "../../pages/public/privacy";

describe("Privacy page", () => {
  it("renders the main heading", () => {
    render(<Privacy />);
    expect(screen.getByRole("heading", { name: /privacy policy/i })).toBeInTheDocument();
  });

  it("renders the last updated date", () => {
    render(<Privacy />);
    expect(screen.getByText(/last updated/i)).toBeInTheDocument();
  });

  it("renders all required sections", () => {
    render(<Privacy />);
    expect(screen.getByText(/information we collect/i)).toBeInTheDocument();
    expect(screen.getByText(/cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/how we use information/i)).toBeInTheDocument();
    expect(screen.getByText(/data security/i)).toBeInTheDocument();
    expect(screen.getByText(/children's privacy/i)).toBeInTheDocument();
  });

  it("renders contact email", () => {
    render(<Privacy />);
    expect(screen.getByText(/privacy@teraexam\.in/i)).toBeInTheDocument();
  });
});
