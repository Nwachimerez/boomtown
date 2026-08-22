/* =========================================================
   CART — persisted in localStorage, shared across pages
   ========================================================= */
const Cart = {
  KEY: "boomtown_cart",

  get(){
    try{ return JSON.parse(localStorage.getItem(this.KEY)) || []; }
    catch(e){ return []; }
  },

  save(items){
    localStorage.setItem(this.KEY, JSON.stringify(items));
    this.renderBadge();
    document.dispatchEvent(new CustomEvent("cart:updated"));
  },

  add(item, qty = 1){
    const items = this.get();
    const existing = items.find(i => i.id === item.id);
    if (existing) existing.qty += qty;
    else items.push({ id: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl || "", qty });
    this.save(items);
  },

  updateQty(id, qty){
    let items = this.get();
    if (qty <= 0){ items = items.filter(i => i.id !== id); }
    else { const it = items.find(i => i.id === id); if (it) it.qty = qty; }
    this.save(items);
  },

  remove(id){
    this.save(this.get().filter(i => i.id !== id));
  },

  clear(){ this.save([]); },

  count(){ return this.get().reduce((s,i)=> s + i.qty, 0); },

  total(){ return this.get().reduce((s,i)=> s + (i.price * i.qty), 0); },

  renderBadge(){
    document.querySelectorAll("[data-cart-count]").forEach(el => {
      el.textContent = this.count();
    });
  },

  formatNaira(n){
    const symbol = (window.RESTAURANT_CONFIG && RESTAURANT_CONFIG.currencySymbol) || "₦";
    return symbol + Number(n).toLocaleString("en-NG");
  }
};

document.addEventListener("DOMContentLoaded", () => Cart.renderBadge());

/* ---------- Cart drawer UI (present on every customer page) ---------- */
function initCartDrawer(){
  const overlay = document.getElementById("cartOverlay");
  const drawer = document.getElementById("cartDrawer");
  const openBtns = document.querySelectorAll("[data-open-cart]");
  const closeBtn = document.getElementById("closeCart");
  const itemsEl = document.getElementById("ticketItems");
  const subtotalEl = document.getElementById("ticketSubtotal");
  const totalEl = document.getElementById("ticketTotal");
  const checkoutBtn = document.getElementById("goToCheckout");

  if (!drawer) return;

  function open(){ overlay.classList.add("open"); drawer.classList.add("open"); }
  function close(){ overlay.classList.remove("open"); drawer.classList.remove("open"); }

  openBtns.forEach(b => b.addEventListener("click", open));
  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);

  function render(){
    const items = Cart.get();
    if (items.length === 0){
      itemsEl.innerHTML = `<div class="empty-cart">Your ticket is empty.<br>Add a dish to get started.</div>`;
    } else {
      itemsEl.innerHTML = items.map(i => `
        <div class="t-item">
          <div class="name">${i.name}</div>
          <div class="line-price">${Cart.formatNaira(i.price * i.qty)}</div>
          <div class="t-qty">
            <button data-dec="${i.id}">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.id}">+</button>
          </div>
          <button class="rm" data-rm="${i.id}">Remove</button>
        </div>
      `).join("");
    }
    const total = Cart.total();
    subtotalEl.textContent = Cart.formatNaira(total);
    totalEl.textContent = Cart.formatNaira(total);
    checkoutBtn.disabled = items.length === 0;

    itemsEl.querySelectorAll("[data-inc]").forEach(b => b.addEventListener("click", () => {
      const it = Cart.get().find(x => x.id === b.dataset.inc);
      Cart.updateQty(b.dataset.inc, it.qty + 1);
    }));
    itemsEl.querySelectorAll("[data-dec]").forEach(b => b.addEventListener("click", () => {
      const it = Cart.get().find(x => x.id === b.dataset.dec);
      Cart.updateQty(b.dataset.dec, it.qty - 1);
    }));
    itemsEl.querySelectorAll("[data-rm]").forEach(b => b.addEventListener("click", () => {
      Cart.remove(b.dataset.rm);
    }));
  }

  document.addEventListener("cart:updated", render);
  render();

  checkoutBtn?.addEventListener("click", () => {
    if (!checkoutBtn.disabled) window.location.href = "checkout.html";
  });
}

document.addEventListener("DOMContentLoaded", initCartDrawer);

function showToast(msg){
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
