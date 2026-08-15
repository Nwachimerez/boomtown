let ALL_ITEMS = [];
let ACTIVE_CAT = "all";

function renderMenuGrid(){
  const grid = document.getElementById("menuGrid");
  const items = ACTIVE_CAT === "all" ? ALL_ITEMS : ALL_ITEMS.filter(i => i.category === ACTIVE_CAT);

  if (items.length === 0){
    grid.innerHTML = `<p style="color:var(--taupe)">No dishes in this category yet.</p>`;
    return;
  }

  grid.innerHTML = items.map(d => {
    const img = d.imageUrl || "";
    return `
      <article class="dish-card">
        <div class="dish-media" style="${img ? `background-image:url('${img}')` : ""}">
          ${d.category ? `<span class="tag">${d.category}</span>` : ""}
        </div>
        <div class="dish-body">
          <h4>${d.name}</h4>
          <p>${d.description || ""}</p>
          <div class="dish-foot">
            <span class="price">${Cart.formatNaira(d.price)}</span>
            <button class="add-btn" data-id="${d.id}" data-name="${d.name}" data-price="${d.price}" data-img="${img}">Add</button>
          </div>
        </div>
      </article>`;
  }).join("");

  grid.querySelectorAll(".add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      Cart.add({ id: btn.dataset.id, name: btn.dataset.name, price: Number(btn.dataset.price), imageUrl: btn.dataset.img }, 1);
      showToast(`${btn.dataset.name} added to your ticket`);
    });
  });
}

function renderCatFilter(){
  const cats = [...new Set(ALL_ITEMS.map(i => i.category).filter(Boolean))];
  const filterEl = document.getElementById("catFilter");
  filterEl.innerHTML = `<button class="cat-chip active" data-cat="all">All</button>` +
    cats.map(c => `<button class="cat-chip" data-cat="${c}">${c}</button>`).join("");

  filterEl.querySelectorAll(".cat-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      filterEl.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      ACTIVE_CAT = chip.dataset.cat;
      renderMenuGrid();
    });
  });
}

async function loadMenu(){
  const grid = document.getElementById("menuGrid");
  try{
    const snap = await db.collection("menuItems").where("available", "==", true).get();
    ALL_ITEMS = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // sort client-side to avoid needing a composite index
    ALL_ITEMS.sort((a,b) => (a.category || "").localeCompare(b.category || "") || a.name.localeCompare(b.name));

    if (ALL_ITEMS.length === 0){
      grid.innerHTML = `<p style="color:var(--taupe)">No dishes published yet — add some from the admin dashboard.</p>`;
      return;
    }
    renderCatFilter();
    renderMenuGrid();
  } catch(err){
    console.error(err);
    grid.innerHTML = `<p style="color:var(--taupe)">Couldn't load the menu right now. Check your connection and refresh.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadMenu);
