export default {
  async fetch(_req: Request): Promise<Response> {
    const content = `<h1 class="coming-soon">COMING SOON</h1>`;

    return new Response(content, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
