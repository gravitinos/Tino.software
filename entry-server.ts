const FRONTEND_OPTIONS = [
  "React",
  "Vue",
  "Svelte",
  "Solid",
  "Preact",
  "HTML",
] as const;

function renderVoteSection(): string {
  const buttons = FRONTEND_OPTIONS.map(
    (name) =>
      `<button type="button" class="vote-btn" data-choice="${name}">${name}</button>`,
  ).join("");

  return `
    <section class="vote" aria-labelledby="vote-heading">
      <p class="vote-kicker">Community</p>
      <h2 id="vote-heading">Vote for frontend</h2>
      <p class="vote-copy">Help shape the stack. Pick the UI layer you want us to ship first.</p>
      <div class="vote-grid" role="group" aria-label="Frontend framework choices">
        ${buttons}
      </div>
      <p class="vote-status" id="vote-status" role="status" aria-live="polite"></p>
      <ul class="vote-results" id="vote-results" aria-label="Current vote totals"></ul>
    </section>
  `;
}

export default {
  async fetch(_req: Request): Promise<Response> {
    const content = `
      <div class="page">
        <header class="hero">
          <p class="eyebrow">Inspired by <a href="https://vercel.com/blog/introducing-geist-pixel">Introducing Geist Pixel</a></p>
          <h1 class="title">Coming Soon</h1>
          <p class="lede">
            A bitmap-inspired type system extension — precise, intentional, and unapologetically digital.
            Built on the same foundations as Geist Sans and Geist Mono.
          </p>
          <div class="variants" aria-label="Geist Pixel variants">
            <span>Square</span>
            <span>Grid</span>
            <span>Circle</span>
            <span>Triangle</span>
            <span>Line</span>
          </div>
        </header>
        ${renderVoteSection()}
        <footer class="footer">
          <a href="https://vercel.com/font">Geist Pixel on Vercel</a>
          <span aria-hidden="true">·</span>
          <a href="https://vercel.com/blog/introducing-geist-pixel">Read the announcement</a>
        </footer>
      </div>
    `;

    return new Response(content, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
