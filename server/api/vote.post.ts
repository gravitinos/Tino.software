import { defineHandler } from "nitro/h3";
import { FRONTEND_CHOICES, castVote } from "../lib/votes";

export default defineHandler(async (event) => {
  const body = (await event.req.json().catch(() => null)) as {
    choice?: string;
  } | null;

  const choice = body?.choice?.trim();
  if (!choice || !FRONTEND_CHOICES.includes(choice as (typeof FRONTEND_CHOICES)[number])) {
    return new Response(
      JSON.stringify({
        error: "Invalid choice",
        allowed: [...FRONTEND_CHOICES],
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const totals = await castVote(choice);
  return { ok: true, choice, totals };
});
