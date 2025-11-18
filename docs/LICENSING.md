QFlash Licensing (Gumroad)

Overview

This project integrates with Gumroad for license sales and verification. You can sell monthly or yearly licenses and validate keys using Gumroad's license API.

Recommended products on Gumroad:
- QFlash Monthly - $5/month
- QFlash Yearly - $39/year

Steps to configure

1. Create products on Gumroad and enable license keys.
2. Obtain your Gumroad account token (Personal access token) or use public product id for verification.
3. Add token to your daemon or CI as environment variable `GUMROAD_TOKEN` (for server-side verify) or store securely.

Local license storage

The CLI stores a local license record at `./.qflash/license.json` after activation. The format contains `key`, `product_id`, `createdAt`, `expiresAt`, and `metadata` from Gumroad.

Server vs Client verification

- Server-side (recommended): Your server calls Gumroad API and returns a short-lived verification to clients.
- Client-side: The client can call Gumroad API directly with a token. Be careful not to leak your private keys.

Integration example

Use `src/utils/gumroad-license.ts` to verify and save license keys.

Security

Do not hardcode your Gumroad token in client-side code. Use a small backend if you need to keep the token secret.
