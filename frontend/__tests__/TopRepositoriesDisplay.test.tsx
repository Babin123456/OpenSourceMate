import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TopRepositoriesDisplay from "../components/TopRepositoriesDisplay";
import type { Repository } from "../types/api";

const mockRepos: Repository[] = [
  {
    name: "react-starter",
    description: "Production ready React template",
    language: "TypeScript",
    stars: 350,
    forks: 42,
    is_fork: false,
    url: "https://github.com/testuser/react-starter",
    updated_at: "2026-03-01T00:00:00Z",
  },
  {
    name: "python-cli",
    description: "Command line utility written in Python",
    language: "Python",
    stars: 120,
    forks: 15,
    is_fork: false,
    url: "https://github.com/testuser/python-cli",
    updated_at: "2026-04-15T00:00:00Z",
  },
  {
    name: "forked-algo",
    description: "Algorithms library",
    language: "C++",
    stars: 800,
    forks: 200,
    is_fork: true,
    url: "https://github.com/testuser/forked-algo",
    updated_at: "2026-05-01T00:00:00Z",
  },
];

describe("TopRepositoriesDisplay", () => {
  it("renders top repositories sorted by stars by default excluding forks", () => {
    render(<TopRepositoriesDisplay repositories={mockRepos} theme="dark" />);
    expect(screen.getByText("Top Repositories")).toBeInTheDocument();
    expect(screen.getByText("react-starter")).toBeInTheDocument();
    expect(screen.getByText("python-cli")).toBeInTheDocument();
    expect(screen.queryByText("forked-algo")).not.toBeInTheDocument();
  });

  it("includes forks when unchecking exclude forks toggle", () => {
    render(<TopRepositoriesDisplay repositories={mockRepos} theme="dark" />);
    const checkbox = screen.getByLabelText(/exclude forks/i);
    fireEvent.click(checkbox);
    expect(screen.getByText("forked-algo")).toBeInTheDocument();
  });

  it("switches to recently active tab", () => {
    render(<TopRepositoriesDisplay repositories={mockRepos} theme="dark" />);
    const recentTab = screen.getByRole("button", { name: /recently active/i });
    fireEvent.click(recentTab);
    expect(screen.getByText("python-cli")).toBeInTheDocument();
  });
});
