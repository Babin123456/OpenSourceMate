import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SkillChart from "../components/SkillChart";
import { COLOR_BLIND_SAFE_PALETTE } from "../utils/colorPalette";

const mockSkills = [
  { name: "TypeScript", repository_count: 15, percentage: 45 },
  { name: "Python", repository_count: 10, percentage: 30 },
  { name: "Go", repository_count: 5, percentage: 15 },
  { name: "Rust", repository_count: 3, percentage: 10 },
];

describe("SkillChart with Color-Blind Safe Palette", () => {
  it("renders skills using the Okabe-Ito color palette", () => {
    const { container } = render(
      <SkillChart skills={mockSkills} totalRepositories={33} theme="dark" />
    );

    // Skill names rendered as accessible text
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Go")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();

    // Check SVG paths or elements have colors matching palette
    const firstColor = COLOR_BLIND_SAFE_PALETTE[0]?.fill.toLowerCase();
    const html = container.innerHTML.toLowerCase();
    expect(html).toContain(firstColor);
  });

  it("renders data table toggle for screen-reader and tabular accessibility", () => {
    render(<SkillChart skills={mockSkills} totalRepositories={33} theme="light" />);

    // Toggle button exists
    const tableButton = screen.getByRole("button", { name: /view as table/i });
    expect(tableButton).toBeInTheDocument();

    fireEvent.click(tableButton);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /skill/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /repositories/i })).toBeInTheDocument();
  });

  it("handles empty skills array gracefully", () => {
    render(<SkillChart skills={[]} totalRepositories={0} theme="dark" />);
    expect(screen.getByText(/no skill data available/i)).toBeInTheDocument();
  });
});
