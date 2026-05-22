import { useStorage } from "nitro/storage";

export const FRONTEND_CHOICES = [
  "React",
  "Vue",
  "Svelte",
  "Solid",
  "Preact",
  "HTML",
] as const;

type Choice = (typeof FRONTEND_CHOICES)[number];
type Totals = Record<Choice, number>;

const STORAGE_KEY = "vote:totals";

function emptyTotals(): Totals {
  return Object.fromEntries(
    FRONTEND_CHOICES.map((name) => [name, 0]),
  ) as Totals;
}

export async function getVoteTotals(): Promise<Totals> {
  const storage = useStorage("data");
  const stored = await storage.getItem<Totals>(STORAGE_KEY);
  return stored ?? emptyTotals();
}

export async function castVote(choice: string): Promise<Totals> {
  const storage = useStorage("data");
  const totals = await getVoteTotals();
  const key = choice as Choice;
  totals[key] += 1;
  await storage.setItem(STORAGE_KEY, totals);
  return totals;
}
