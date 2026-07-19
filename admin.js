// ============================================================
// admin.js — auth gate + CRUD for contacts & projects
// Relies on firebase-config.js already having run (db, auth, ADMIN_EMAIL).
// Real enforcement is in Firestore security rules — this file just
// gives a friendly UI and blocks obviously-wrong logins early.
// ============================================================

const loginBox   = document.getElementById("loginBox");
const dashboard  = document.getElementById("dashboard");
const authError  = document.getElementById("authError");
const whoami     = document.getElementById("whoami");

// ---------- AUTH ----------
document.getElementById("loginBtn").addEventListener("click", async () => {
  authError.textContent = "";
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) {
    authError.textContent = "> Error: Email and password required.";
    return;
  }
  try {
    await auth.signInWithEmailAndPassword(email, password);
    // onAuthStateChanged below handles the rest.
  } catch (err) {
    authError.textContent = "> Error: " + (err.message || "Login failed.");
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => auth.signOut());

auth.onAuthStateChanged(async (user) => {
  if (user && user.email === ADMIN_EMAIL) {
    loginBox.style.display = "none";
    dashboard.style.display = "block";
    whoami.textContent = user.email;
    loadContacts();
    loadProjects();
  } else if (user && user.email !== ADMIN_EMAIL) {
    authError.textContent = "> Error: This account is not authorized for admin access.";
    await auth.signOut();
  } else {
    loginBox.style.display = "block";
    dashboard.style.display = "none";
  }
});

// ---------- TABS ----------
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ============================================================
// CONTACTS CRUD
// ============================================================
const contactsList   = document.getElementById("contactsList");
const contactMsg     = document.getElementById("contactMsg");
const contactEditId  = document.getElementById("contactEditId");
const contactFormTitle = document.getElementById("contactFormTitle");
const contactSaveBtn = document.getElementById("contactSaveBtn");
const contactCancelBtn = document.getElementById("contactCancelBtn");

async function loadContacts() {
  contactsList.innerHTML = `<p class="admin-tag">Loading...</p>`;
  try {
    const snap = await db.collection("contacts").orderBy("order", "asc").get();
    if (snap.empty) {
      contactsList.innerHTML = `<p class="admin-tag">// No contacts yet. Add one below.</p>`;
      return;
    }
    contactsList.innerHTML = snap.docs.map(doc => {
      const c = doc.data();
      return `
        <div class="item-row">
          <div class="item-info">
            ${escapeHtml(c.icon)} <strong>${escapeHtml(c.label)}</strong> — ${escapeHtml(c.value)} (order: ${c.order})
            <div class="item-sub">${escapeHtml(c.url)}</div>
          </div>
          <div class="item-actions">
            <button class="btn-admin outline" onclick="editContact('${doc.id}')">Edit</button>
            <button class="btn-admin danger" onclick="deleteContact('${doc.id}')">Delete</button>
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    contactsList.innerHTML = `<p class="msg err">Failed to load: ${escapeHtml(err.message)}</p>`;
  }
}

contactSaveBtn.addEventListener("click", async () => {
  const icon = document.getElementById("contactIcon").value.trim() || "🔗";
  const order = Number(document.getElementById("contactOrder").value) || 0;
  const label = document.getElementById("contactLabel").value.trim();
  const value = document.getElementById("contactValue").value.trim();
  const url = document.getElementById("contactUrl").value.trim();

  if (!label || !value || !url) {
    contactMsg.className = "msg err";
    contactMsg.textContent = "> Label, display text, and URL are required.";
    return;
  }

  const data = { icon, order, label, value, url };
  contactSaveBtn.disabled = true;
  try {
    const editId = contactEditId.value;
    if (editId) {
      await db.collection("contacts").doc(editId).update(data);
      contactMsg.textContent = "> Contact updated ✓";
    } else {
      await db.collection("contacts").add(data);
      contactMsg.textContent = "> Contact added ✓";
    }
    contactMsg.className = "msg ok";
    resetContactForm();
    loadContacts();
  } catch (err) {
    contactMsg.className = "msg err";
    contactMsg.textContent = "> Error: " + err.message;
  } finally {
    contactSaveBtn.disabled = false;
  }
});

contactCancelBtn.addEventListener("click", resetContactForm);

function resetContactForm() {
  contactEditId.value = "";
  document.getElementById("contactIcon").value = "";
  document.getElementById("contactOrder").value = "";
  document.getElementById("contactLabel").value = "";
  document.getElementById("contactValue").value = "";
  document.getElementById("contactUrl").value = "";
  contactFormTitle.textContent = "Add New Contact";
  contactSaveBtn.textContent = "Add Contact";
  contactCancelBtn.style.display = "none";
}

window.editContact = async (id) => {
  const doc = await db.collection("contacts").doc(id).get();
  if (!doc.exists) return;
  const c = doc.data();
  contactEditId.value = id;
  document.getElementById("contactIcon").value = c.icon || "";
  document.getElementById("contactOrder").value = c.order ?? "";
  document.getElementById("contactLabel").value = c.label || "";
  document.getElementById("contactValue").value = c.value || "";
  document.getElementById("contactUrl").value = c.url || "";
  contactFormTitle.textContent = "Edit Contact";
  contactSaveBtn.textContent = "Save Changes";
  contactCancelBtn.style.display = "inline-block";
  window.scrollTo({ top: document.getElementById("contactFormTitle").offsetTop - 100, behavior: "smooth" });
};

window.deleteContact = async (id) => {
  if (!confirm("Delete this contact? This cannot be undone.")) return;
  try {
    await db.collection("contacts").doc(id).delete();
    loadContacts();
  } catch (err) {
    alert("Failed to delete: " + err.message);
  }
};

// ============================================================
// PROJECTS CRUD
// ============================================================
const projectsList   = document.getElementById("projectsList");
const projectMsg     = document.getElementById("projectMsg");
const projectEditId  = document.getElementById("projectEditId");
const projectFormTitle = document.getElementById("projectFormTitle");
const projectSaveBtn = document.getElementById("projectSaveBtn");
const projectCancelBtn = document.getElementById("projectCancelBtn");

async function loadProjects() {
  projectsList.innerHTML = `<p class="admin-tag">Loading...</p>`;
  try {
    const snap = await db.collection("projects").orderBy("createdAt", "desc").get();
    if (snap.empty) {
      projectsList.innerHTML = `<p class="admin-tag">// No projects yet. Add one below.</p>`;
      return;
    }
    projectsList.innerHTML = snap.docs.map((doc, i) => {
      const p = doc.data();
      return `
        <div class="item-row">
          <div class="item-info">
            ${escapeHtml(p.icon)} <strong>${escapeHtml(p.title)}</strong> ${i === 0 ? " (Latest)" : ""}
            <div class="item-sub">${escapeHtml((p.stack || []).join(", "))}</div>
          </div>
          <div class="item-actions">
            <button class="btn-admin outline" onclick="editProject('${doc.id}')">Edit</button>
            <button class="btn-admin danger" onclick="deleteProject('${doc.id}')">Delete</button>
          </div>
        </div>`;
    }).join("");
  } catch (err) {
    projectsList.innerHTML = `<p class="msg err">Failed to load: ${escapeHtml(err.message)}</p>`;
  }
}

projectSaveBtn.addEventListener("click", async () => {
  const icon = document.getElementById("projectIcon").value.trim() || "⚡";
  const title = document.getElementById("projectTitle").value.trim();
  const description = document.getElementById("projectDescription").value.trim();
  const stack = document.getElementById("projectStack").value.trim()
    .split(",").map(s => s.trim()).filter(Boolean);
  const liveUrl = document.getElementById("projectLiveUrl").value.trim();
  const githubUrl = document.getElementById("projectGithubUrl").value.trim();

  if (!title || !description) {
    projectMsg.className = "msg err";
    projectMsg.textContent = "> Title and description are required.";
    return;
  }

  projectSaveBtn.disabled = true;
  try {
    const editId = projectEditId.value;
    if (editId) {
      await db.collection("projects").doc(editId).update({ icon, title, description, stack, liveUrl, githubUrl });
      projectMsg.textContent = "> Project updated ✓";
    } else {
      await db.collection("projects").add({
        icon, title, description, stack, liveUrl, githubUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      projectMsg.textContent = "> Project added ✓ (shows as \"Latest\")";
    }
    projectMsg.className = "msg ok";
    resetProjectForm();
    loadProjects();
  } catch (err) {
    projectMsg.className = "msg err";
    projectMsg.textContent = "> Error: " + err.message;
  } finally {
    projectSaveBtn.disabled = false;
  }
});

projectCancelBtn.addEventListener("click", resetProjectForm);

function resetProjectForm() {
  projectEditId.value = "";
  document.getElementById("projectIcon").value = "";
  document.getElementById("projectTitle").value = "";
  document.getElementById("projectDescription").value = "";
  document.getElementById("projectStack").value = "";
  document.getElementById("projectLiveUrl").value = "";
  document.getElementById("projectGithubUrl").value = "";
  projectFormTitle.textContent = "Add New Project";
  projectSaveBtn.textContent = "Add Project";
  projectCancelBtn.style.display = "none";
}

window.editProject = async (id) => {
  const doc = await db.collection("projects").doc(id).get();
  if (!doc.exists) return;
  const p = doc.data();
  projectEditId.value = id;
  document.getElementById("projectIcon").value = p.icon || "";
  document.getElementById("projectTitle").value = p.title || "";
  document.getElementById("projectDescription").value = p.description || "";
  document.getElementById("projectStack").value = (p.stack || []).join(", ");
  document.getElementById("projectLiveUrl").value = p.liveUrl || "";
  document.getElementById("projectGithubUrl").value = p.githubUrl || "";
  projectFormTitle.textContent = "Edit Project";
  projectSaveBtn.textContent = "Save Changes";
  projectCancelBtn.style.display = "inline-block";
  window.scrollTo({ top: document.getElementById("projectFormTitle").offsetTop - 100, behavior: "smooth" });
};

window.deleteProject = async (id) => {
  if (!confirm("Delete this project? This cannot be undone.")) return;
  try {
    await db.collection("projects").doc(id).delete();
    loadProjects();
  } catch (err) {
    alert("Failed to delete: " + err.message);
  }
};

// Note: editing a project does NOT change its createdAt, so its position
// in the "latest first" ordering stays the same after an edit.
