async function loadFeatured(){
  const grid = document.getElementById("featuredGrid");
  try{
    const snap = await db.collection("menuItems")
      .where("available", "==", true)
      .orderBy("createdAt", "desc")
      .limit(4)
      .get();

    if (snap.empty){
      grid.innerHTML = `<p style="color:var(--taupe)">No dishes published yet — add some from the admin dashboard.</p>`;
      return;
    }

    grid.innerHTML = snap.docs.map(doc => {
      const d = doc.data();
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
              <button class="add-btn" data-id="${doc.id}" data-name="${d.name}" data-price="${d.price}" data-img="${img}">Add</button>
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
  } catch(err){
    console.error(err);
    grid.innerHTML = `<p style="color:var(--taupe)">Couldn't load the menu right now. Check your connection and refresh.</p>`;
  }
}
document.addEventListener("DOMContentLoaded", loadFeatured);
