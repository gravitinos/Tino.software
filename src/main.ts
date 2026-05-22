type Totals = Record<string, number>;

const statusEl = document.getElementById("vote-status");
const resultsEl = document.getElementById("vote-results");

function renderTotals(totals: Totals): void {
  if (!resultsEl) return;

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, count]) => count));

  resultsEl.innerHTML = entries
    .map(([name, count]) => {
      const width = Math.round((count / max) * 100);
      return `<li>
        <span class="vote-label">${name}</span>
        <span class="vote-bar" style="--fill: ${width}%"></span>
        <span class="vote-count">${count}</span>
      </li>`;
    })
    .join("");
}

async function refreshTotals(): Promise<void> {
  const response = await fetch("/api/votes");
  if (!response.ok) return;
  const data = (await response.json()) as { totals: Totals };
  renderTotals(data.totals);
}

async function submitVote(choice: string, button: HTMLButtonElement): Promise<void> {
  button.disabled = true;
  if (statusEl) statusEl.textContent = `Submitting vote for ${choice}…`;

  try {
    const response = await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ choice }),
    });

    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Vote failed");
    }

    renderTotals(payload.totals);
    if (statusEl) statusEl.textContent = `Thanks — you voted for ${choice}.`;
  } catch (error) {
    if (statusEl) {
      statusEl.textContent =
        error instanceof Error ? error.message : "Could not submit vote.";
    }
  } finally {
    button.disabled = false;
  }
}

document.querySelectorAll<HTMLButtonElement>(".vote-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const choice = button.dataset.choice;
    if (!choice) return;
    void submitVote(choice, button);
  });
});

void refreshTotals();
