// Tap a dish photo to see it bigger, with its description, price and an Add button.
// Uses the app's own MENU, cart, list(), bar(), money() and esc() from index.html.
(function () {
  const st = document.createElement("style");
  st.textContent = `
  .pic{cursor:zoom-in}
  #zv{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;z-index:20;align-items:center;justify-content:center;padding:16px}
  #zv.open{display:flex}
  #zv .box{background:var(--bg);color:var(--ink);border-radius:20px;width:100%;max-width:440px;max-height:92vh;overflow:auto;padding:14px;font-family:var(--body)}
  #zv .zh{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
  #zv h2{font:800 22px/1.15 var(--head);margin:4px 0 0}
  #zv .zpic{border-radius:16px;overflow:hidden;background:var(--tile);aspect-ratio:1/1;display:grid;place-items:center;font-size:110px}
  #zv .zpic img{width:100%;height:100%;object-fit:cover;display:block}
  #zv .zd{color:var(--muted);margin:12px 2px 4px;font-size:16px}
  #zv .zf{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px}
  #zv .zp{font:800 24px var(--head)}
  #zv .add{padding:12px 20px;font-size:16px}`;
  document.head.appendChild(st);

  const v = document.createElement("div");
  v.id = "zv";
  v.innerHTML = '<div class="box" role="dialog" aria-modal="true"></div>';
  document.body.appendChild(v);

  let cur = null;
  function show(id) {
    cur = id;
    const m = MENU.find(x => x.id == id), q = cart[id] || 0;
    const pic = m.img ? `<img src="${m.img}" alt="${esc(m.name)}">` : `<span>${m.e}</span>`;
    v.querySelector(".box").innerHTML =
      `<div class="zh"><h2>${esc(m.name)}</h2><button class="x" data-zclose aria-label="Close">✕</button></div>
       <div class="zpic">${pic}</div><p class="zd">${esc(m.desc)}</p>
       <div class="zf"><span class="zp">${money(m.price)}</span>` +
      (q ? `<div class="step"><button data-zd aria-label="Remove one">−</button><span>${q}</span><button data-zi aria-label="Add one">+</button></div>`
         : `<button class="add" data-zi>Add to order</button>`) + `</div>`;
    v.classList.add("open");
  }
  const refresh = () => { list(); bar(); };

  document.addEventListener("click", e => {
    const p = e.target.closest(".pic");
    if (!p) return;
    const h = p.closest(".item") && p.closest(".item").querySelector("h3");
    const m = h && MENU.find(x => x.name === h.textContent);
    if (m) show(m.id);
  });
  v.addEventListener("click", e => {
    if (e.target === v || e.target.closest("[data-zclose]")) { v.classList.remove("open"); return; }
    if (e.target.closest("[data-zi]")) { cart[cur] = (cart[cur] || 0) + 1; refresh(); show(cur); }
    else if (e.target.closest("[data-zd]")) { cart[cur]--; if (cart[cur] <= 0) delete cart[cur]; refresh(); show(cur); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") v.classList.remove("open"); });
})();
