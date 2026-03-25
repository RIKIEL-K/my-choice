import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./index";
import { BrowserRouter } from "react-router-dom";

const meta: Meta<typeof Header> = {
  title: "UI/Header",
  component: Header,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    onEditProfile: { action: "onEditProfile" },
    onLogout: { action: "onLogout" },
  },
};
export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {},
};

export const WithoutProfileEdit: Story = {
  args: {
    onEditProfile: undefined,
  },
};
