import { client, authed, fail, GW_ID, SITE, providerOf } from './_lib.js';

// Called by the Cloudflare worker. Amount is decided by the worker from ITS database.
export default async function handler(req, res) {
  if (req.method !== 'POST') return fail(res, 405, 'POST only');
  if (!authed(req)) return fail(res, 401, 'Bad bridge key');
  try {
    const { orderId, amount, phone } = req.body || {};
    const provider = providerOf(req.body && req.body.provider);
    const back = `https://${req.headers.host}/api/callback?o=${encodeURIComponent(orderId)}`;
    const rupees = Number(amount);
    if (!GW_ID.test(String(orderId || ''))) return fail(res, 400, 'Bad order id');
    if (!Number.isFinite(rupees) || rupees < 1 || rupees > 100000) return fail(res, 400, 'Amount must be between ₹1 and ₹1,00,000');
    const paise = Math.round(rupees * 100);
    const p = await client(provider).createPayment({
      amount: paise,
      orderId,
      customerPhone: /^\d{10}$/.test(String(phone || '')) ? String(phone) : '9000000000',
      // Paytm sends the customer's browser to callbackUrl; PhonePe sends a background message to callbackUrl and the browser to redirectUrl.
      callbackUrl: provider === 'phonepe' ? `https://${req.headers.host}/api/webhook` : `https://${req.headers.host}/api/callback`,
      redirectUrl: provider === 'phonepe' ? back : SITE(),
    });
    return res.status(200).json({ ok: true, paymentUrl: p.paymentUrl });
  } catch (e) {
    console.error('create failed', e && e.message);
    return fail(res, 502, String((e && e.message) || 'Could not create payment').slice(0, 200));
  }
}
