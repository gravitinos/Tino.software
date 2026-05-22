import { defineHandler } from "nitro/h3";
import { getVoteTotals } from "../lib/votes";

export default defineHandler(async () => {
  const totals = await getVoteTotals();
  return { totals };
});
