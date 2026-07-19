// ============================================================
// site-data.js
// Fetches contacts + projects from Firestore and renders them
// into the public pages (index.html, contact.html).
// Runs read-only — no login needed, matches Firestore rules
// that allow public "read" on both collections.
// ============================================================

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- CONTACTS ----------
// contacts collection doc shape: { icon, label, value, url, order }
async function renderContacts(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const snap = await db.collection("contacts").orderBy("order", "asc").get();
    if (snap.empty) {
      container.innerHTML = `<p style="font-family:var(--font-mono);color:var(--clr-muted);font-size:0.8rem;">// No contacts added yet.</p>`;
      return;
    }
    container.innerHTML = snap.docs.map(doc => {
      const c = doc.data();
      return `
        <div class="contact-item glass">
          <span class="c-icon">${escapeHtml(c.icon || "🔗")}</span>
          <div>
            <span class="c-label">${escapeHtml(c.label)}</span>
            <a href="${escapeHtml(c.url)}" target="_blank" class="c-val">${escapeHtml(c.value)}</a>
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    console.error("Failed to load contacts:", err);
    container.innerHTML = `<p style="font-family:var(--font-mono);color:var(--clr-muted);font-size:0.8rem;">// Contacts unavailable right now.</p>`;
  }
}

// ---------- PROJECTS ----------
// projects collection doc shape:
// { icon, title, description, stack: [..], liveUrl, githubUrl, createdAt }
async function renderProjects(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const snap = await db.collection("projects").orderBy("createdAt", "desc").get();
    const cardsHtml = snap.docs.map((doc, i) => {
      const p = doc.data();
      const stackHtml = (p.stack || []).map(s => `<span>${escapeHtml(s)}</span>`).join("");
      const num = String(i + 1).padStart(2, "0");
      const isLatest = i === 0;
      return `
        <article class="project-card glass reveal${isLatest ? " featured" : ""}">
          <div class="project-meta">
            <span class="project-num">${num}</span>
            ${isLatest ? `<span class="project-tag">Latest</span>` : ""}
          </div>
          <div class="project-img"><div class="img-placeholder"><span>${escapeHtml(p.icon || "⚡")}</span></div></div>
          <div class="project-info">
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.description)}</p>
            <div class="project-stack">${stackHtml}</div>
            <div class="project-links">
              ${p.liveUrl ? `<a href="${escapeHtml(p.liveUrl)}" target="_blank" class="btn-sm">Live Demo ↗</a>` : ""}
              ${p.githubUrl ? `<a href="${escapeHtml(p.githubUrl)}" target="_blank" class="btn-sm outline">GitHub</a>` : ""}
            </div>
          </div>
        </article>`;
    }).join("");

    // Keep the static "More Coming Soon" card that's already in the HTML —
    // just insert the dynamic cards before it.
    const moreSoonCard = container.querySelector(".more-soon");
    const temp = document.createElement("div");
    temp.innerHTML = cardsHtml;
    if (moreSoonCard) {
      while (temp.firstChild) container.insertBefore(temp.firstChild, moreSoonCard);
    } else {
      container.innerHTML = cardsHtml;
    }
  } catch (err) {
    console.error("Failed to load projects:", err);
    // Leave whatever static content exists (e.g. "More Coming Soon") untouched.
  }
}
