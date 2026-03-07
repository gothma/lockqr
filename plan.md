# Task: Client-Side QR Encryption Website

Create a small static web application that allows users to encrypt a secret with a passphrase and store it as a QR code, and also decrypt a QR code using the same passphrase.

The site will be deployed as a **static website using Jekyll**, so **all cryptographic operations must run entirely in the browser using JavaScript**. No server or backend processing is allowed.

The goal is a **simple offline-capable tool** for storing short secrets (passwords, recovery codes, etc.) inside QR codes protected by a passphrase.

---

# Functional Requirements

The website must provide two main features:

## 1. Encrypt Secret → QR Code

User workflow:

1. User enters a secret (text).
2. User enters a passphrase.
3. The secret is encrypted using the passphrase.
4. The encrypted data is encoded as Base64.
5. A QR code is generated from that Base64 string.
6. The QR code can be downloaded or saved.

Constraints:

- Only **one passphrase** is used.
- No additional keys or secrets.
- Encryption must include a **random salt**.
- Use a **key derivation function** so the passphrase is hardened.

---

## 2. Scan QR → Decrypt Secret

User workflow:

1. User scans a QR code using the device camera OR uploads a QR image.
2. The QR content is read as Base64.
3. User enters the passphrase.
4. The data is decrypted.
5. The original secret is displayed.

---

# Cryptography Requirements

Use **modern browser-native cryptography** via the Web Crypto API.

Implementation requirements:

Encryption:

- AES-256-CBC
- Random 16 byte IV
- Random 16 byte salt
- Key derived from passphrase using:

PBKDF2 with:
- SHA-256
- 200000 iterations
- 256-bit key length

Encryption process:

1. Generate random salt
2. Derive key with PBKDF2(passphrase, salt)
3. Generate random IV
4. Encrypt secret with AES-CBC
5. Concatenate:

salt | iv | ciphertext

6. Encode result as Base64

Decryption process:

1. Decode Base64
2. Extract salt, IV, ciphertext
3. Derive key using PBKDF2(passphrase, salt)
4. Decrypt AES-CBC
5. Display plaintext

No integrity verification is required for this project.

---

# QR Code Requirements

Use a JavaScript QR library such as:

- qrcode.js
or
- qrcode-generator

The QR must encode the Base64 encrypted payload.

For scanning QR codes use a browser compatible library such as:

- html5-qrcode
or
- jsQR

Support:

- Camera scanning
- Image upload

---

# UI Requirements

Create a minimal interface with two sections:

## Encrypt

Inputs:

- textarea: secret
- password field: passphrase

Button:

- "Encrypt & Generate QR"

Output:

- QR code preview
- download QR button
- encrypted Base64 string (optional)

---

## Decrypt

Inputs:

- QR scanner (camera)
- file upload for QR image
- password field: passphrase

Button:

- "Decrypt"

Output:

- decrypted secret

---

# Technical Constraints

The site must:

- work fully **client side**
- make **no network requests**
- not send secrets anywhere
- run from a **static Jekyll site**

Structure example:

```
/_layouts/default.html
/index.md
/assets/js/encrypt.js
/assets/js/qr.js
/assets/css/style.css
```

All logic should live in JavaScript files inside `/assets/js`.

---

# Additional Requirements

Security UX:

- Warn if passphrase is empty
- Clear plaintext fields after encryption/decryption
- Allow copying results
- Display errors if passphrase is incorrect

Compatibility:

- Must work on
  - modern desktop browsers
  - iOS Safari
  - Android Chrome

---

# Deliverables

Implement:

1. HTML layout
2. JavaScript encryption/decryption logic
3. QR generation
4. QR scanning
5. Minimal CSS styling

Ensure the page can run **entirely offline after loading**.

---

# Notes

This tool is intended for storing **small secrets** (e.g. passwords, recovery codes) inside QR codes protected by a passphrase.

No backend, databases, or servers should be used.