import { electionClient } from "@/lib/electionClient";

export const electionFetcher = async <T>(url: string): Promise<T> => {
    const res = await electionClient.get<T>(url);
    return res.data;
};
