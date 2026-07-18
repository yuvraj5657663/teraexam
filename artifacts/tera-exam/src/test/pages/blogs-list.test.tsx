import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BlogsList from "../../pages/public/blogs-list";

describe("BlogsList page", () => {
  it("renders the page heading", () => {
    render(<BlogsList />);
    expect(screen.getByRole("heading", { name: /aspirant blog zone/i })).toBeInTheDocument();
  });

  it("renders the search input", () => {
    render(<BlogsList />);
    expect(screen.getByRole("textbox", { name: /search blog/i })).toBeInTheDocument();
  });

  it("renders category filter buttons", () => {
    render(<BlogsList />);
    expect(screen.getByRole("button", { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ssc/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upsc/i })).toBeInTheDocument();
  });

  it("renders blog cards", () => {
    render(<BlogsList />);
    expect(screen.getByText(/ssc cgl 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/upsc prelims/i)).toBeInTheDocument();
  });

  it("filters blogs by search query", async () => {
    const user = userEvent.setup();
    render(<BlogsList />);
    const search = screen.getByRole("textbox", { name: /search blog/i });
    await user.type(search, "UPSC");
    expect(screen.getByText(/upsc prelims/i)).toBeInTheDocument();
    expect(screen.queryByText(/ssc cgl/i)).not.toBeInTheDocument();
  });

  it("filters blogs by category", async () => {
    const user = userEvent.setup();
    render(<BlogsList />);
    const sscBtn = screen.getByRole("button", { name: "SSC" });
    await user.click(sscBtn);
    expect(screen.getByText(/ssc cgl 2026/i)).toBeInTheDocument();
    expect(screen.queryByText(/upsc prelims/i)).not.toBeInTheDocument();
  });

  it("shows no results message when search has no match", async () => {
    const user = userEvent.setup();
    render(<BlogsList />);
    const search = screen.getByRole("textbox", { name: /search blog/i });
    await user.type(search, "xyzthiscannotmatch123");
    expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
  });

  it("clicking All resets category filter", async () => {
    const user = userEvent.setup();
    render(<BlogsList />);
    await user.click(screen.getByRole("button", { name: "SSC" }));
    await user.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText(/upsc prelims/i)).toBeInTheDocument();
  });

  it("renders Read Article links", () => {
    render(<BlogsList />);
    const links = screen.getAllByText(/read article/i);
    expect(links.length).toBeGreaterThan(0);
  });
});
