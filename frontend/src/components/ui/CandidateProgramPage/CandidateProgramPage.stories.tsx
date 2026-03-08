import type { Meta, StoryObj } from "@storybook/react";
import { CandidateProgramPage } from "./index";
import { getCandidateProgramById } from "./candidatesProgramData";

const candidate = getCandidateProgramById(1)!;

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
        candidate,
        onBack: () => {},
    },
};

export const ThomasMartin: Story = {
    args: {
        candidate: getCandidateProgramById(2)!,
        onBack: () => {},
    },
};

export const EmmaRodriguez: Story = {
    args: {
        candidate: getCandidateProgramById(3)!,
        onBack: () => {},
    },
};
