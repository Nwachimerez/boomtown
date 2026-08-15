function showToast(msg){
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
function formatNaira(n){ return "₦" + Number(n).toLocaleString("en-NG"); }

/* ---------- Auth gate ---------- */
auth.onAuthStateChanged(async (user) => {
  const gate = document.getElementById("authGate");
  const shell = document.getElementById("adminShell");
  if (!user){
    window.location.href = "login.html";
    return;
  }
  const isAdmin = await checkIsAdmin(user.uid);
  if (!isAdmin){
    gate.innerHTML = `<p style="color:var(--pepper)">This account isn't authorized for the admin dashboard.</p>`;
    setTimeout(() => auth.signOut().then(() => window.location.href = "login.html"), 2000);
    return;
  }
  gate.style.display = "none";
  shell.style.display = "grid";
  initDashboard();
});

document.getElementById("signOutBtn")?.addEventListener("click", () => auth.signOut());

/* ---------- View switching ---------- */
document.querySelectorAll(".side-link[data-view]").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".side-link[data-view]").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(link.dataset.view).classList.add("active");
  });
});

let dashInitialized = false;
function initDashboard(){
  if (dashInitialized) return;
  dashInitialized = true;
  loadMenuItems();
  loadOrders();
  initItemModal();
}

/* =========================================================
   MENU ITEMS
   ========================================================= */
async function loadMenuItems(){
  const tbody = document.getElementById("menuTableBody");
  try{
    const snap = await db.collection("menuItems").orderBy("createdAt", "desc").get();
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    document.getElementById("menuStats").innerHTML = `
      <div class="stat-card"><b>${items.length}</b><span>Total items</span></div>
      <div class="stat-card"><b>${items.filter(i=>i.available).length}</b><span>Live on menu</span></div>
      <div class="stat-card"><b>${new Set(items.map(i=>i.category)).size}</b><span>Categories</span></div>
    `;

    if (items.length === 0){
      tbody.innerHTML = `<tr><td colspan="5" style="color:var(--taupe)">No menu items yet — add your first dish.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(d => `
      <tr>
        <td>
          <div class="item-name-cell">
            <div class="row-thumb" style="${d.imageUrl ? `background-image:url('${d.imageUrl}')` : ""}"></div>
            <span>${d.name}</span>
          </div>
        </td>
        <td>${d.category || "—"}</td>
        <td>${formatNaira(d.price)}</td>
        <td><span class="badge ${d.available ? "avail" : "hidden"}">${d.available ? "Available" : "Hidden"}</span></td>
        <td>
          <div class="row-actions">
            <button data-edit="${d.id}">Edit</button>
            <button data-delete="${d.id}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("[data-edit]").forEach(btn => {
      btn.addEventListener("click", () => openItemModal(items.find(i => i.id === btn.dataset.edit)));
    });
    tbody.querySelectorAll("[data-delete]").forEach(btn => {
      btn.addEventListener("click", () => deleteItem(btn.dataset.delete));
    });
  } catch(err){
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="5" style="color:var(--pepper)">Couldn't load menu items.</td></tr>`;
  }
}

async function deleteItem(id){
  if (!confirm("Delete this menu item? This can't be undone.")) return;
  try{
    await db.collection("menuItems").doc(id).delete();
    showToast("Item deleted");
    loadMenuItems();
  } catch(err){
    console.error(err);
    alert("Couldn't delete item.");
  }
}

let selectedImageFile = null;

/* Uploads a File to Cloudinary via an unsigned upload preset and
   returns the hosted image URL. No Firebase Storage / Blaze plan needed. */
async function uploadToCloudinary(file){
  if (CLOUDINARY_CLOUD_NAME === "YOUR_CLOUD_NAME"){
    throw new Error("Cloudinary isn't configured yet — set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in js/firebase-config.js");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "boomtown-menu");

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });
  if (!res.ok){
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Cloudinary upload failed");
  }
  const data = await res.json();
  return data.secure_url;
}

function initItemModal(){
  const overlay = document.getElementById("itemModalOverlay");
  const form = document.getElementById("itemForm");

  document.getElementById("addItemBtn").addEventListener("click", () => openItemModal(null));
  document.getElementById("cancelItemBtn").addEventListener("click", closeItemModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeItemModal(); });

  document.getElementById("itemImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      document.getElementById("imgPreview").style.backgroundImage = `url('${ev.target.result}')`;
      document.getElementById("imgPreview").textContent = "";
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", saveItem);
}

function openItemModal(item){
  selectedImageFile = null;
  document.getElementById("itemFormError").style.display = "none";
  document.getElementById("itemForm").reset();
  document.getElementById("modalTitle").textContent = item ? "Edit menu item" : "Add menu item";
  document.getElementById("itemId").value = item ? item.id : "";
  document.getElementById("itemName").value = item ? item.name : "";
  document.getElementById("itemDesc").value = item ? (item.description || "") : "";
  document.getElementById("itemPrice").value = item ? item.price : "";
  document.getElementById("itemCategory").value = item ? (item.category || "") : "";
  document.getElementById("itemAvailable").value = item ? String(item.available) : "true";
  const preview = document.getElementById("imgPreview");
  if (item && item.imageUrl){
    preview.style.backgroundImage = `url('${item.imageUrl}')`;
    preview.textContent = "";
  } else {
    preview.style.backgroundImage = "";
    preview.textContent = "No image selected";
  }
  document.getElementById("itemModalOverlay").classList.add("open");
}

function closeItemModal(){
  document.getElementById("itemModalOverlay").classList.remove("open");
}

async function saveItem(e){
  e.preventDefault();
  const btn = document.getElementById("saveItemBtn");
  const errEl = document.getElementById("itemFormError");
  errEl.style.display = "none";
  btn.disabled = true;
  btn.textContent = "Saving…";

  try{
    const id = document.getElementById("itemId").value;
    const payload = {
      name: document.getElementById("itemName").value.trim(),
      description: document.getElementById("itemDesc").value.trim(),
      price: Number(document.getElementById("itemPrice").value),
      category: document.getElementById("itemCategory").value.trim(),
      available: document.getElementById("itemAvailable").value === "true"
    };

    if (selectedImageFile){
      payload.imageUrl = await uploadToCloudinary(selectedImageFile);
    }

    if (id){
      await db.collection("menuItems").doc(id).update(payload);
      showToast("Item updated");
    } else {
      payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      if (!payload.imageUrl) payload.imageUrl = "";
      await db.collection("menuItems").add(payload);
      showToast("Item added to menu");
    }

    closeItemModal();
    loadMenuItems();
  } catch(err){
    console.error(err);
    errEl.textContent = "Couldn't save this item. Please try again.";
    errEl.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.textContent = "Save item";
  }
}

/* =========================================================
   ORDERS
   ========================================================= */
async function loadOrders(){
  const tbody = document.getElementById("ordersTableBody");
  try{
    const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(100).get();
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const pending = orders.filter(o => o.orderStatus === "pending").length;
    const todayTotal = orders.reduce((s,o) => s + (o.total || 0), 0);
    document.getElementById("orderStats").innerHTML = `
      <div class="stat-card"><b>${orders.length}</b><span>Orders (latest 100)</span></div>
      <div class="stat-card"><b>${pending}</b><span>Pending</span></div>
      <div class="stat-card"><b>${formatNaira(todayTotal)}</b><span>Total value</span></div>
    `;

    if (orders.length === 0){
      tbody.innerHTML = `<tr><td colspan="6" style="color:var(--taupe)">No orders yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => `
      <tr>
        <td>${o.reference || o.id}</td>
        <td>${o.fullName || "—"}<br><span style="color:var(--taupe); font-size:12px;">${o.phone || ""}</span></td>
        <td>${o.fulfillment || "—"}</td>
        <td>${formatNaira(o.total || 0)}</td>
        <td>
          <select class="status-select" data-order="${o.id}">
            ${["pending","preparing","ready","completed"].map(s => `<option value="${s}" ${o.orderStatus===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </td>
        <td style="color:var(--taupe); font-size:12px;">${o.createdAt ? new Date(o.createdAt.toDate()).toLocaleString() : "—"}</td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".status-select").forEach(sel => {
      sel.addEventListener("change", async () => {
        try{
          await db.collection("orders").doc(sel.dataset.order).update({ orderStatus: sel.value });
          showToast("Order status updated");
        } catch(err){
          console.error(err);
          alert("Couldn't update order status.");
        }
      });
    });
  } catch(err){
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--pepper)">Couldn't load orders.</td></tr>`;
  }
}
