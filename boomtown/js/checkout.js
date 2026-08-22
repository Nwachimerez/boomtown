const DELIVERY_FEE = (window.RESTAURANT_CONFIG && RESTAURANT_CONFIG.deliveryFee) || 1500;
let FULFILLMENT = "pickup";

function renderCheckoutSummary(){
  const items = Cart.get();
  const itemsEl = document.getElementById("checkoutItems");
  const subtotal = Cart.total();
  const total = subtotal + (FULFILLMENT === "delivery" ? DELIVERY_FEE : 0);

  if (items.length === 0){
    itemsEl.innerHTML = `<p style="font-family:var(--body); color:var(--taupe); font-size:13px;">Your ticket is empty. <a href="menu.html" style="color:var(--amber)">Go build an order →</a></p>`;
    document.getElementById("payBtn").disabled = true;
  } else {
    itemsEl.innerHTML = items.map(i => `
      <div class="t-row"><span>${i.qty} × ${i.name}</span><span>${Cart.formatNaira(i.price * i.qty)}</span></div>
    `).join("");
    document.getElementById("payBtn").disabled = false;
  }

  document.getElementById("coSubtotal").textContent = Cart.formatNaira(subtotal);
  document.getElementById("coTotal").textContent = Cart.formatNaira(total);
  document.getElementById("deliveryFeeRow").style.display = FULFILLMENT === "delivery" ? "flex" : "none";
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
  document.addEventListener("cart:updated", renderCheckoutSummary);

  document.querySelectorAll("[data-fulfillment]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-fulfillment]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      FULFILLMENT = btn.dataset.fulfillment;
      document.getElementById("addressField").style.display = FULFILLMENT === "delivery" ? "block" : "none";
      document.getElementById("address").required = FULFILLMENT === "delivery";
      renderCheckoutSummary();
    });
  });

  document.getElementById("payBtn").addEventListener("click", startPayment);
});

function startPayment(){
  const form = document.getElementById("checkoutForm");
  if (!form.reportValidity()) return;

  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const notes = document.getElementById("notes").value.trim();
  const items = Cart.get();
  const subtotal = Cart.total();
  const total = subtotal + (FULFILLMENT === "delivery" ? DELIVERY_FEE : 0);
  const reference = "BT" + Date.now() + Math.floor(Math.random() * 1000);

  const payBtn = document.getElementById("payBtn");
  payBtn.disabled = true;
  payBtn.textContent = "Opening payment…";

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: Math.round(total * 100), // kobo
    currency: "NGN",
    ref: reference,
    metadata: { fullName, phone, fulfillment: FULFILLMENT },
    callback: function(response){
      payBtn.textContent = "Confirming payment…";
      finalizeOrder({
        reference: response.reference,
        fullName, phone, email, address, notes,
        fulfillment: FULFILLMENT,
        items, subtotal, deliveryFee: FULFILLMENT === "delivery" ? DELIVERY_FEE : 0, total
      });
    },
    onClose: function(){
      payBtn.disabled = false;
      payBtn.textContent = "Pay with Paystack";
    }
  });
  handler.openIframe();
}

async function finalizeOrder(order){
  try{
    const res = await fetch("/.netlify/functions/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: order.reference })
    });
    const result = await res.json();

    if (!result.verified){
      alert("We couldn't confirm your payment. If you were charged, contact us on WhatsApp with reference " + order.reference + ".");
      document.getElementById("payBtn").disabled = false;
      document.getElementById("payBtn").textContent = "Pay with Paystack";
      return;
    }

    const docRef = await db.collection("orders").add({
      ...order,
      paymentStatus: "paid",
      orderStatus: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    Cart.clear();
    window.location.href = `order-confirmation.html?order=${docRef.id}&ref=${order.reference}`;
  } catch(err){
    console.error(err);
    alert("Payment succeeded but we couldn't save your order. Please contact us on WhatsApp with reference " + order.reference + ".");
  }
}
