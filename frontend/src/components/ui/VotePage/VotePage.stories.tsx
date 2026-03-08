import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "react-hot-toast";
import { VotePage } from "./index";

const meta: Meta<typeof VotePage> = {
    title: "Pages/VotePage",
    component: VotePage,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    decorators: [
        (Story) => (
            <>
                <Story />
                <Toaster position="top-center" />
            </>
        ),
    ],
    argTypes: {
        onBack: { action: "onBack" },
    },
};

export default meta;

type Story = StoryObj<typeof VotePage>;

export const Default: Story = {
    args: {
        onBack: () => {},
    },
};
