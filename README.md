# Rajesh UPIPay gateway (Vercel) - Paytm or PhonePe

Runs UPIPay (https://github.com/iamrobinsharaya/upipay). Cloudflare worker -> this project -> Paytm / PhonePe.
Choose the active one with PAY_PROVIDER = paytm or phonepe (Vercel) and PAY_PROVIDER in Cloudflare too.

## Vercel variables (Settings -> Environment Variables, Production, then Redeploy)
Always: BRIDGE_KEY (long random text), SITE_URL (https://therajesh.shop), PAY_PROVIDER (paytm or phonepe)

Paytm: PAYTM_MERCHANT_ID, PAYTM_MERCHANT_KEY, PAYTM_ENV (sandbox or production)
PhonePe: PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX (usually 1), PHONEPE_ENV (sandbox or production)

## Cloudflare variables (then redeploy the site)
PAY_GATEWAY_URL = https://YOUR-PROJECT.vercel.app , BRIDGE_KEY = same text , PAY_PROVIDER = same as Vercel

## Test
Sandbox first, then production with a Rs 1 order. After the first install replace "latest" in package.json with the exact upipay version.
