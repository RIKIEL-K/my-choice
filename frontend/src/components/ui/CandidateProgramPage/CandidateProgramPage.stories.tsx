import type { Meta, StoryObj } from "@storybook/react";
import { CandidateProgramPage } from "./index";
import { getMockCandidateById } from "./candidatesProgramData";

const meta: Meta<typeof CandidateProgramPage> = {
    title: "Pages/CandidateProgramPage",
    component: CandidateProgramPage,
    tags: ["autodocs"],
    parameters: { layout: "padded" },
    argTypes: {
        onBack: { action: "onBack" },
    },
};

export default meta;

type Story = StoryObj<typeof CandidateProgramPage>;

export const Default: Story = {
    args: {
        candidate: getMockCandidateById("cand-1")!,
        electionTitle: "Élections BDE 2026",
        onBack: () => {},
    },
};

export const ThomasMartin: Story = {
    args: {
        candidate: getMockCandidateById("cand-2")!,
        electionTitle: "Élections BDE 2026",
        onBack: () => {},
    },
};

export const EmmaRodriguez: Story = {
    args: {
        candidate: getMockCandidateById("cand-3")!,
        electionTitle: "Élections BDE 2026",
        onBack: () => {},
    },
};
