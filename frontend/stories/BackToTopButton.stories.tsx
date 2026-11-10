import type { Meta, StoryObj } from "@storybook/react";
import BackToTopButton from "../components/BackToTopButton";

const meta: Meta<typeof BackToTopButton> = {
  title: "Components/BackToTopButton",
  component: BackToTopButton,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    threshold: {
      control: "number",
      description: "Scroll threshold in pixels before the button appears",
    },
    label: {
      control: "text",
      description: "Accessible ARIA label and title attribute",
    },
  },
};

export default meta;
type Story = StoryObj<typeof BackToTopButton>;

export const Default: Story = {
  args: {
    threshold: 0,
    label: "Scroll back to top of page",
  },
  render: (args) => (
    <div className="relative min-h-[300px] w-full p-8 bg-slate-950 text-slate-300">
      <p className="mb-4">
        Scroll down or view the floating back to top button in the bottom right corner.
      </p>
      <BackToTopButton {...args} />
    </div>
  ),
};

export const CustomThreshold: Story = {
  args: {
    threshold: 150,
    label: "Return to Top",
  },
  render: (args) => (
    <div className="relative min-h-[400px] w-full p-8 bg-slate-950 text-slate-300">
      <p className="mb-4">Floating action button triggers on scroll threshold.</p>
      <BackToTopButton {...args} />
    </div>
  ),
};
