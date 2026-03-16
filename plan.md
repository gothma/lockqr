# Task: Client-Side QR Encryption Website (Encode-In-URL Variant)

Create a static web app that encrypts secrets with a passphrase and stores them in QR codes.

The app runs as a **static Jekyll site**. All cryptography must run in-browser via JavaScript.
No backend processing is allowed.

---

# Functional Requirements

## 1. Encrypt Secret -> Share Link -> QR

User workflow:

1. User enters secret text.
2. User enters passphrase.
3. Secret is encrypted.
4. Binary payload is versioned and encoded as Base64URL.
5. App builds a share link using current origin/path and query payload.
6. QR code is generated from the full share link.
7. User can copy link or download QR image.

Output visibility behavior:

- The encrypt result box (QR + link + action buttons) is hidden initially.
- It becomes visible only after successful encryption.

Share link format:

- `https://<host>[:port]/<path>?<base64url_payload>`

## 2. Decrypt from QR/Image/Link

User workflow:

1. User scans QR with camera OR uploads QR image OR pastes payload/link.
2. App extracts payload from query part if input is a full URL.
3. User enters passphrase.
4. App decrypts and shows plaintext.

Deep-link behavior:

- On page load, if URL query is non-empty, treat it as payload.
- Pre-fill decrypt payload input from query.
- Auto-scroll to decrypt section.

---

# Cryptography Requirements

Use Web Crypto API.

## Algorithms/Parameters

- AES-256-CBC
- PBKDF2 (SHA-256)
- PBKDF2 iterations: `600000`
- Salt: 16 random bytes
- IV: 16 random bytes

## Payload Versioning

Binary payload layout before encoding:

- `version(1 byte) | salt(16) | iv(16) | ciphertext(n)`

Rules:

- During encryption, prepend version byte `0x00`.
- During decryption, first decoded byte must be `0x00`.
- If first byte is different, throw an error indicating this instance is outdated and include upgrade URL guidance.

## Encoding

- Encode payload as **Base64URL**.
- URL-safe encoding only (`+` -> `-`, `/` -> `_`, no trailing `=`).

---

# QR Requirements

- QR encodes the full share URL (not raw binary, not plain base64 text field)
- Camera scan supported
- Image upload scan supported

Libraries:

- `qrcodejs` for generation
- `jsQR` for decoding

---

# UI Requirements

## Encrypt section

Inputs:

- secret textarea
- passphrase input

Actions:

- `Encrypt & Generate QR`
- `Download QR`
- `Copy Share Link`

Outputs:

- clickable share link
- QR preview

## Decrypt section

Inputs:

- camera scan trigger button
- QR image upload
- payload textarea
- passphrase input

Actions:

- `Decrypt`

Outputs:

- decrypted secret
- copy decrypted secret action

Scanner behavior:

- Video element hidden by default.
- Shown only after user presses `Start Camera Scan`.

---

# Technical Constraints

- Fully client-side secret handling
- No backend
- Static Jekyll-compatible site
- QR dependencies loaded from pinned CDN URLs with SRI

---

# Deliverables

1. HTML/Jekyll layout and page
2. JavaScript encryption/decryption implementation
3. Link-in-query payload handling
4. QR generation and decoding
5. Minimal CSS styling

