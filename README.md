# LockQR MVP

LockQR is a static Jekyll site that encrypts short secrets into QR codes and decrypts them back in-browser.

All cryptography and QR processing run client-side. No backend is used. Test it [here](https://gothma.github.io/lockqr)

## Features

- Encrypt secret text with a passphrase
- Derive key using PBKDF2 (SHA-256, 200000 iterations)
- Encrypt using AES-256-CBC
- Pack payload as `salt | iv | ciphertext` and Base64 encode
- Generate downloadable QR code from encrypted Base64 payload
- Decrypt by scanning QR with camera or uploading a QR image
- Copy encrypted payload and decrypted secret

## Tech Stack

- Jekyll static site
- Web Crypto API (browser native)
- `qrcodejs` (QR generation)
- `jsQR` (QR decoding)

## Dependency Loading Strategy

- CDN-only loading for QR libraries with pinned versions and Subresource Integrity (SRI)
- Core app logic (`assets/js/*.js`) is always served locally

## Project Structure

- `_layouts/default.html` - base layout and script includes
- `index.md` - main UI
- `assets/css/style.css` - minimal styles
- `assets/js/encrypt.js` - crypto logic
- `assets/js/qr.js` - QR generation/scanning helpers
- `assets/js/app.js` - UI event wiring

## Run Locally

### Option 1: Jekyll (recommended)

Prerequisites:

- Ruby + Bundler + Jekyll installed

Run:

```bash
jekyll serve
```

Open:

- `http://127.0.0.1:4000/`

### Option 2: Any static server

You can serve the directory with any static HTTP server.

Example:

```bash
python3 -m http.server 4000
```

Open:

- `http://127.0.0.1:4000/`


## Offline Behavior

App logic is fully client-side and makes no network requests.

QR libraries are loaded from pinned CDNs with SRI verification.
If CDN resources are blocked or unavailable, QR features will not initialize.

## Security Notes

- Intended for small secrets (passwords, recovery codes, short notes)
- AES-CBC is used per plan requirements
- This MVP does **not** add an integrity/authentication tag (no MAC/AEAD)
- Treat passphrases as high entropy for better resistance to guessing
