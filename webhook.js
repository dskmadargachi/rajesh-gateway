import { GW_ID, pingSite } from './_lib.js';

// PhonePe's background (server-to-server) message. The body is {"response":"<base64 json>"}.
// It is NOT trusted: we only read the order id to wake the worker, and the worker confirms through /api/status.
export default async function handler(req, res) {
  try {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const data = JSON.parse(Buffer.from(String(b.response || ''), 'base64').toString('utf8'));
    const m = GW_ID.exec(String((data.data && data.data.merchantTransactionId) || ''));
    if (m) await pingSite(m[1]);
  } catch {}
  return res.status(200).send('OK');
}
