import type { Meta, StoryObj } from "@storybook/react";
import ThemeToggle from "../components/ThemeToggle";

const meta: Meta<typeof ThemeToggle> = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: "select",
      options: ["dark", "light"],
      description: "Active UI theme mode",
    },
    showTextLabel: {
      control: "boolean",
      description: "Whether to render an accompanying text label",
    },
    onToggleTheme: {
      action: "toggled",
      description: "Callback fired when the toggle button is clicked or activated via keyboard",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeToggle>;

export const DarkModeActive: Story = {
  args: {
    theme: "dark",
    showTextLabel: false,
  },
};

export const LightModeActive: Story = {
  args: {
    theme: "light",
    showTextLabel: false,
  },
};

export const WithVisibleTextLabel: Story = {
  args: {
    theme: "dark",
    showTextLabel: true,
  },
};

export const LightModeWithVisibleTextLabel: Story = {
  args: {
    theme: "light",
    showTextLabel: true,
  },
};
