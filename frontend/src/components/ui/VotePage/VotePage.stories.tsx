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
        alreadyVoted: {
            control: "boolean",
            description: "Simule le cas où l'utilisateur a déjà voté.",
        },
    },
};

export default meta;

type Story = StoryObj<typeof VotePage>;

/** Formulaire de vote standard */
export const Default: Story = {
    args: {
        onBack: () => {},
        alreadyVoted: false,
    },
};

/** L'utilisateur a déjà voté — affiche le banner informatif */
export const AlreadyVoted: Story = {
    args: {
        onBack: () => {},
        alreadyVoted: true,
    },
};
