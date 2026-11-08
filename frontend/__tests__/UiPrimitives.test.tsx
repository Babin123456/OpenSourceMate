import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, Card, Badge } from "../components/ui";

describe("Shared UI Primitives", () => {
  describe("Button Component", () => {
    it("renders label correctly", () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("handles click events", () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Trigger</Button>);
      fireEvent.click(screen.getByRole("button", { name: /trigger/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("applies loading state and disables interaction", () => {
      render(<Button isLoading>Loading Action</Button>);
      const btn = screen.getByRole("button", { name: /loading action/i });
      expect(btn).toBeDisabled();
    });

    it("renders with light and dark themes", () => {
      const { rerender } = render(<Button theme="dark">Theme Test</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-emerald-500");

      rerender(<Button theme="light">Theme Test</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-emerald-600");
    });
  });

  describe("Card Component", () => {
    it("renders children with proper padding and border", () => {
      render(
        <Card data-testid="test-card">
          <p>Card Content</p>
        </Card>
      );
      expect(screen.getByTestId("test-card")).toHaveClass("rounded-2xl", "p-6");
      expect(screen.getByText("Card Content")).toBeInTheDocument();
    });

    it("applies interactive variant styling", () => {
      render(
        <Card variant="interactive" data-testid="interactive-card">
          Interactive
        </Card>
      );
      expect(screen.getByTestId("interactive-card")).toHaveClass("hover:border-slate-700");
    });
  });

  describe("Badge Component", () => {
    it("renders with default styling", () => {
      render(<Badge>Default Badge</Badge>);
      expect(screen.getByText("Default Badge")).toHaveClass("rounded-full", "text-emerald-400");
    });

    it("renders colored variants", () => {
      render(<Badge variant="purple">Purple Variant</Badge>);
      expect(screen.getByText("Purple Variant")).toHaveClass("text-purple-400");
    });
  });
});
