// Shared helpers (files starting with "_" are not exposed as URLs by Vercel).
import { UPIPay } from 'upipay';
import { timingSafeEqual } from 'node:crypto';

export const SITE = () => (process.env.SITE_URL || 'https://therajesh.shop').replace(/\/+$/, '');

export const providerOf = (p) => (String(p || process.env.PAY_PROVIDER || 'paytm').toLowerCase() === 'phonepe' ? 'phonepe' : 'paytm');

export function client(provider) {
  const e = process.env;
  if (providerOf(provider) === 'phonepe') {
    if (!e.PHONEPE_MERCHANT_ID || !e.PHONEPE_SALT_KEY) throw new Error('PHONEPE_MERCHANT_ID / PHONEPE_SALT_KEY are not set in Vercel');
    return new UPIPay({
      provider: 'phonepe',
      environment: e.PHONEPE_ENV === 'production' ? 'production' : 'sandbox',
      credentials: { merchantId: e.PHONEPE_MERCHANT_ID, saltKey: e.PHONEPE_SALT_KEY, saltIndex: e.PHONEPE_SALT_INDEX || '1' },
    });
  }
  if (!e.PAYTM_MERCHANT_ID || !e.PAYTM_MERCHANT_KEY) throw new Error('PAYTM_MERCHANT_ID / PAYTM_MERCHANT_KEY are not set in Vercel');
  return new UPIPay({
    provider: 'paytm',
    environment: e.PAYTM_ENV === 'production' ? 'production' : 'sandbox',   // anything but "production" = safe test mode
    credentials: { merchantId: e.PAYTM_MERCHANT_ID, merchantKey: e.PAYTM_MERCHANT_KEY },
  });
}

// Only your Cloudflare worker may call create/status: it sends the shared BRIDGE_KEY.
export function authed(req) {
  const a = Buffer.from(String(req.headers['x-bridge-key'] || ''));
  const b = Buffer.from(String(process.env.BRIDGE_KEY || ''));
  return b.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

// Our gateway order id: RJ + 6-char shop order id + T + attempt suffix
export const GW_ID = /^RJ([A-Z0-9]{6})T[A-Z0-9]{1,12}$/;

export function fail(res, code, error) { return res.status(code).json({ ok: false, error }); }

// Wake the Cloudflare worker: reading the order makes it ask /api/status itself. Never trusted for the result.
export async function pingSite(shopId) {
  try { await fetch(`${SITE()}/api/orders/${shopId}`, { signal: AbortSignal.timeout(8000) }); } catch {}
}
