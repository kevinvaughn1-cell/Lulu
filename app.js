// Web3Forms access key: get one free at web3forms.com using the inbox orders should go to.
const WEB3FORMS_KEY = "f977bdbc-e3e7-4a41-96db-0c8751a2e808";

(function () {
  const $ = (s) => document.querySelector(s);
  const IMG_VERSION = 2; // bump when you replace a photo
  const img = (n) => `images/${n}.jpg?v=${IMG_VERSION}`;
  const money = (n) => "$" + (Math.round(n * 100) / 100).toLocaleString();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const items = {};
  CATALOG.forEach((c) => c.items.forEach((i) => (items[i.id] = i)));

  // ---------- Render catalog ----------
  $("#tabs").innerHTML =
    CATALOG.map((c) => `<a href="#${c.id}">${esc(c.title)}</a>`).join("") + `<a href="#fabrics">Fabrics</a>`;

  $("#catalog").innerHTML = CATALOG.map((c) => `
    <section class="collection" id="${c.id}">
      <h2>${esc(c.title)}</h2>
      <p class="sub">${esc(c.sub)}</p>
      <div class="grid">
        ${c.items.map((i) => `
          <button class="card" data-id="${i.id}">
            <span class="photo"><img src="${img(i.img)}" alt="" loading="lazy"></span>
            <span class="name">${esc(i.name)}</span>
            <span class="price">${esc(i.priceLabel || money(i.price))}</span>
            <span class="desc">${esc(i.desc)}</span>
          </button>`).join("")}
      </div>
    </section>`).join("");

  const swatch = ([name, file]) =>
    `<figure><img src="${img(file)}" alt="" loading="lazy"><figcaption>${esc(name)}</figcaption></figure>`;
  $("#swatches").innerHTML = FABRICS.map(swatch).join("");
  $("#strips").innerHTML = STRIPS.map(swatch).join("");

  // ---------- Order state ----------
  let order = [];
  try { order = JSON.parse(localStorage.getItem("lulu-order")) || []; } catch (e) {}
  const save = () => { try { localStorage.setItem("lulu-order", JSON.stringify(order)); } catch (e) {} };

  function lineTotal(item, extra, qty) {
    if (item.price == null) return null;
    let base;
    if (item.bundle) {
      const [n, p] = item.bundle;
      base = Math.floor(qty / n) * p + (qty % n) * item.price;
    } else base = item.price * qty;
    return base + extra * qty;
  }

  // ---------- Item dialog ----------
  const dlg = $("#itemDialog");
  let current = null;

  function optionsHTML(item) {
    let html = "";
    (item.options || []).forEach((o, k) => {
      html += `<label class="field">${esc(o.label)}<select data-opt="${k}">` +
        o.choices.map(([n, add]) => `<option value="${add}">${esc(n)}${add ? ` (+${money(add)})` : ""}</option>`).join("") +
        `</select></label>`;
    });
    if (item.fabric) {
      html += `<div class="field">Fabric<div class="fabric-pick">` +
        [["No preference", null]].concat(FABRICS).map(([n, f], k) => `
          <label title="${esc(n)}"><input type="radio" name="fabric" value="${esc(n)}" ${k === 0 ? "checked" : ""}>
          ${f ? `<img src="${img(f)}" alt="">` : `<span class="any">Any</span>`}<small>${esc(n)}</small></label>`).join("") +
        `</div></div>`;
    }
    return html;
  }

  function readChoices() {
    let extra = 0; const picked = [];
    dlg.querySelectorAll("select[data-opt]").forEach((s) => {
      extra += Number(s.value);
      const o = current.options[s.dataset.opt];
      const name = s.options[s.selectedIndex].text.replace(/ \(\+.*\)$/, "");
      if (name !== "None") picked.push(o.label === "Size" ? name : name);
    });
    const f = dlg.querySelector("input[name=fabric]:checked");
    if (f && f.value !== "No preference") picked.push(f.value);
    return { extra, picked };
  }

  function updateTotal() {
    const qty = Math.max(1, parseInt($("#dQty").value) || 1);
    const { extra } = readChoices();
    const t = lineTotal(current, extra, qty);
    $("#dTotal").textContent = t == null ? "Price confirmed when we reach out" : money(t);
  }

  function openItem(id) {
    current = items[id];
    $("#dImg").src = img(current.img);
    $("#dName").textContent = current.name;
    $("#dPrice").textContent = current.priceLabel || money(current.price);
    $("#dDesc").textContent = current.desc;
    $("#dOptions").innerHTML = optionsHTML(current);
    $("#dQty").value = 1;
    updateTotal();
    dlg.showModal();
  }

  $("#catalog").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openItem(card.dataset.id);
  });
  dlg.addEventListener("input", updateTotal);
  dlg.addEventListener("change", updateTotal);
  dlg.querySelectorAll("[data-step]").forEach((b) => b.addEventListener("click", () => {
    $("#dQty").value = Math.max(1, (parseInt($("#dQty").value) || 1) + Number(b.dataset.step));
    updateTotal();
  }));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("close", () => {
    if (dlg.returnValue !== "add") return;
    const qty = Math.max(1, parseInt($("#dQty").value) || 1);
    const { extra, picked } = readChoices();
    order.push({ id: current.id, qty, extra, picked });
    save(); renderOrder();
    dlg.returnValue = "";
  });

  // ---------- Order dialog ----------
  const od = $("#orderDialog");
  function describe(l) {
    const i = items[l.id];
    return `${l.qty}${i.unit ? " " + i.unit : ""} × ${i.name}${l.picked.length ? " (" + l.picked.join(", ") + ")" : ""}`;
  }
  function renderOrder() {
    const count = order.reduce((a, l) => a + l.qty, 0);
    $("#cartCount").textContent = count;
    $("#cartBtn").hidden = count === 0;
    let total = 0, ask = false;
    $("#orderList").innerHTML = order.map((l, k) => {
      const t = lineTotal(items[l.id], l.extra, l.qty);
      if (t == null) ask = true; else total += t;
      return `<li><img src="${img(items[l.id].img)}" alt=""><span>${esc(describe(l))}</span>
        <strong>${t == null ? "TBD" : money(t)}</strong>
        <button class="remove" data-k="${k}" aria-label="Remove">&times;</button></li>`;
    }).join("") || `<li class="empty">Nothing here yet.</li>`;
    const label = money(total) + (ask ? " + items to confirm" : "");
    $("#orderTotal").textContent = label;
    $("#itemsField").value = order.map((l) => {
      const t = lineTotal(items[l.id], l.extra, l.qty);
      return `${describe(l)} — ${t == null ? "TBD" : money(t)}`;
    }).join("\n");
    $("#totalField").value = label;
    if (!count && od.open) od.close();
  }
  $("#orderList").addEventListener("click", (e) => {
    const b = e.target.closest(".remove");
    if (b) { order.splice(Number(b.dataset.k), 1); save(); renderOrder(); }
  });
  $("#cartBtn").addEventListener("click", () => od.showModal());
  $("#orderClose").addEventListener("click", () => od.close());
  od.addEventListener("click", (e) => { if (e.target === od) od.close(); });

  $("#orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target, btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending…";
    const data = new FormData(form);
    // Copy saved in Netlify (Forms tab), as a backup.
    const toNetlify = fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString()
    }).then((r) => r.ok);
    // Email to Lulu via Web3Forms (free).
    const toEmail = WEB3FORMS_KEY ? fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `New Lulu order from ${data.get("name")}`,
        from_name: "Lulu Artisan Goods website",
        botcheck: data.get("bot-field") || "",
        ...(/@/.test(data.get("contact")) ? { replyto: data.get("contact") } : {}),
        Name: data.get("name"),
        Contact: data.get("contact"),
        "Needed by": data.get("needed-by") || "—",
        Items: data.get("items"),
        "Estimated total": data.get("estimated-total"),
        Notes: data.get("notes") || "—"
      })
    }).then((r) => r.ok) : Promise.resolve(false);
    try {
      const results = await Promise.all([toNetlify.catch(() => false), toEmail.catch(() => false)]);
      if (!results.some(Boolean)) throw new Error("send failed");
      order = []; save(); renderOrder(); form.reset();
      od.close(); $("#thanksDialog").showModal();
    } catch (err) {
      alert("Sorry, that didn't send. Please try again in a moment.");
    } finally {
      btn.disabled = false; btn.textContent = "Send order request";
    }
  });
  $("#thanksClose").addEventListener("click", () => $("#thanksDialog").close());

  renderOrder();
})();
