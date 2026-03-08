import type { Meta, StoryObj } from "@storybook/react";
import { CandidatesPage } from "./index";

const meta: Meta<typeof CandidatesPage> = {
    title: "Pages/CandidatesPage",
    component: CandidatesPage,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    argTypes: {
        onViewProgram: { action: "onViewProgram" },
    },
};

export default meta;

type Story = StoryObj<typeof CandidatesPage>;

export const Default: Story = {};

export const WithViewProgramCallback: Story = {
    args: {
        onViewProgram: (candidateId) => {
            console.log("Voir le programme du candidat", candidateId);
        },
    },
};
