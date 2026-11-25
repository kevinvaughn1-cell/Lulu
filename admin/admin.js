(function () {
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const when = (d) => new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
  let data = null, list = [];

  async function load() {
    const r = await fetch("/api/admin/data", { credentials: "same-origin" });
    if (r.status === 401) return showLogin();
    if (r.status === 503) return showLogin("The admin page isn't set up yet.");
    if (!r.ok) return showLogin("Couldn't load right now. Try again in a moment.");
    data = await r.json();
    render();
    $("#login").hidden = true; $("#app").hidden = false;
  }

  function showLogin(msg) {
    $("#app").hidden = true; $("#login").hidden = false;
    $("#loginMsg").textContent = msg || ""; $("#loginMsg").hidden = !msg;
  }

  // One list: signups plus anyone who ticked the box on an order. Newest first, one row per email.
  function buildList() {
    const rows = [
      ...data.updates.map((u) => ({ date: u.date, name: u.name, email: u.email, source: u.source || "Signup form" })),
      ...data.orders.filter((o) => o["new-pieces"]).map((o) => ({ date: o.date, name: o.name, email: o.contact, source: "Order form" }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    const seen = new Set();
    return rows.filter((r) => {
      const k = String(r.email || "").trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k); return true;
    });
  }

  function render() {
    list = buildList();
    $("#listCount").textContent = `(${list.length})`;
    $("#orderCount").textContent = `(${data.orders.length})`;
    $("#listTable").innerHTML = list.length
      ? `<tr><th>Email</th><th>Name</th><th>From</th><th>Added</th></tr>` + list.map((r) => `
        <tr><td>${esc(r.email)}${isEmail(r.email) ? "" : ` <span class="flag">not an email</span>`}</td>
        <td>${esc(r.name)}</td><td>${esc(r.source)}</td><td>${esc(when(r.date))}</td></tr>`).join("")
      : `<tr><td class="empty-msg">No one yet.</td></tr>`;
    const orders = [...data.orders].sort((a, b) => new Date(b.date) - new Date(a.date));
    $("#orderCards").innerHTML = orders.length ? orders.map((o) => `
      <div class="order">
        <h3>${esc(o.name)}</h3>
        <p class="meta">${esc(when(o.date))} · ${esc(o.contact)}${o["needed-by"] ? ` · needed by ${esc(o["needed-by"])}` : ""}${o["new-pieces"] ? " · wants new-piece emails" : ""}</p>
        <pre>${esc(o.items)}</pre>
        <p><strong>Estimated total:</strong> ${esc(o["estimated-total"])}</p>
        ${o.notes ? `<p><strong>Notes:</strong> ${esc(o.notes)}</p>` : ""}
      </div>`).join("") : `<p class="empty-msg">No orders yet.</p>`;
  }

  function csv(rows, cols) {
    const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return [cols.map(([h]) => cell(h)).join(","), ...rows.map((r) => cols.map(([, k]) => cell(r[k])).join(","))].join("\r\n");
  }
  function download(name, text) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  const stamp = () => new Date().toISOString().slice(0, 10);

  $("#loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    btn.disabled = true; btn.textContent = "Checking…";
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: $("#pw").value })
      });
      if (r.ok) { $("#pw").value = ""; await load(); }
      else showLogin(r.status === 503 ? "The admin page isn't set up yet." : "That password didn't work.");
    } catch (err) { showLogin("Couldn't reach the site. Try again."); }
    finally { btn.disabled = false; btn.textContent = "Sign in"; }
  });

  document.querySelectorAll("[data-tab]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll("[data-tab]").forEach((x) => x.classList.toggle("on", x === a));
    $("#tab-list").hidden = a.dataset.tab !== "list";
    $("#tab-orders").hidden = a.dataset.tab !== "orders";
  }));

  $("#copyEmails").addEventListener("click", async () => {
    const emails = list.map((r) => String(r.email).trim()).filter(isEmail);
    const text = emails.join(", ");
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {}
    $("#copyMsg").hidden = false;
    $("#copyMsg").textContent = !emails.length ? "No emails yet."
      : ok ? `Copied ${emails.length} email${emails.length > 1 ? "s" : ""}. Paste them into the BCC line.`
      : "Couldn't copy automatically. Select these and copy: " + text;
  });
  $("#csvList").addEventListener("click", () =>
    download(`lulu-new-piece-list-${stamp()}.csv`, csv(list, [["Email", "email"], ["Name", "name"], ["From", "source"], ["Added", "date"]])));
  $("#csvOrders").addEventListener("click", () =>
    download(`lulu-orders-${stamp()}.csv`, csv(data.orders, [["Date", "date"], ["Name", "name"], ["Contact", "contact"], ["Items", "items"],
      ["Estimated total", "estimated-total"], ["Needed by", "needed-by"], ["Notes", "notes"], ["New-piece emails", "new-pieces"]])));
  $("#refresh").addEventListener("click", load);
  $("#logout").addEventListener("click", async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    showLogin();
  });

  load();
})();
