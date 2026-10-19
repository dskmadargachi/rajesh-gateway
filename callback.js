import { client, GW_ID, SITE, pingSite } from './_lib.js';

// Paytm sends the CUSTOMER'S BROWSER here (form POST) after payment.
// We never trust this data: we only wake the worker (which asks /api/status itself) and send the customer back.
export default async function handler(req, res) {
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const q = req.query || {};
  const m = GW_ID.exec(String(body.ORDERID || body.orderId || q.o || ''));
  if (!m) return res.redirect(303, SITE());
  const shopId = m[1];
  if (body.CHECKSUMHASH) {   // Paytm only; informational, the real proof is /api/status
    try { client('paytm').verifyWebhook(new URLSearchParams(body).toString(), body.CHECKSUMHASH); }
    catch (e) { console.warn('callback checksum check failed', e && e.message); }
  }
  await pingSite(shopId);
  return res.redirect(303, `${SITE()}/#order=${shopId}`);
}
