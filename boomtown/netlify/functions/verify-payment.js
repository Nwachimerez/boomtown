// Netlify serverless function — verifies a Paystack transaction server-side.
// Set PAYSTACK_SECRET_KEY in Netlify: Site settings -> Environment variables.
// Uses global fetch (available in Netlify's Node 18+ runtime by default).

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { reference } = JSON.parse(event.body || "{}");
    if (!reference) {
      return { statusCode: 400, body: JSON.stringify({ verified: false, error: "Missing reference" }) };
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { statusCode: 500, body: JSON.stringify({ verified: false, error: "Server missing PAYSTACK_SECRET_KEY" }) };
    }

    const psRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` }
    });
    const psData = await psRes.json();

    const ok = psData.status === true && psData.data && psData.data.status === "success";

    return {
      statusCode: 200,
      body: JSON.stringify({
        verified: ok,
        amount: ok ? psData.data.amount / 100 : null,
        currency: ok ? psData.data.currency : null,
        paidAt: ok ? psData.data.paid_at : null
      })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ verified: false, error: "Verification failed" }) };
  }
};
