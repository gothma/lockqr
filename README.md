# LockQR

LockQR is a static Jekyll site for encrypting small secrets into QR codes and decrypting them in-browser.

Demo: [https://gothma.github.io/lockqr](https://gothma.github.io/lockqr)

## What It Does

- Encrypts plaintext with a passphrase
- Builds a shareable link containing encrypted payload in the URL query
- Encodes that link as a QR code
- Decrypts from:
  - scanned QR code
  - uploaded QR image
  - pasted payload or full link
  - direct page load with payload in query

## Current Payload Format

- Binary layout before encoding:
  - `version(1 byte) | salt(16 bytes) | iv(16 bytes) | ciphertext`
- `version` is currently fixed to `0x00`
- Encoded with Base64URL (URL-safe, no `=` padding)
- Shared URL format:
  - `https://<host>[:port]/<path>?<base64url_payload>`

## Cryptography

- Web Crypto API (client-side only)
- AES-256-CBC
- PBKDF2 (SHA-256)
- Iterations: `600000`
- Salt: `16` bytes random
- IV: `16` bytes random

## Dependency Loading

- `qrcodejs` and `jsQR` are loaded from pinned CDNs with SRI in layout
- App logic (`assets/js/*.js`) is local

## Run Locally

### Jekyll

```bash
jekyll serve --host 127.0.0.1 --port 4000
```

Open `http://127.0.0.1:4000/`



## Security Notes

- Intended for small secrets (passwords, recovery codes, short notes)
- AES-CBC is used by design requirement
- No integrity/authentication tag (no MAC/AEAD)
