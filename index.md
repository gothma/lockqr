---
layout: default
title: LockQR
---

# LockQR

Store short secrets in encrypted QR codes. All encryption and scanning run fully in your browser.

<div class="grid">
  <section class="card" aria-labelledby="encrypt-title">
    <h2 id="encrypt-title">Encrypt</h2>
    <label for="secret-input">Secret</label>
    <textarea id="secret-input" rows="5" placeholder="Enter password, code, or short note"></textarea>

    <label for="encrypt-passphrase">Passphrase</label>
    <input id="encrypt-passphrase" type="password" autocomplete="off" />

    <button id="encrypt-btn" type="button">Encrypt &amp; Generate QR</button>

    <p class="status" id="encrypt-status" role="status" aria-live="polite"></p>

    <div id="qr-container" class="qr-box" aria-label="Generated QR code"></div>

    <div class="row">
      <button id="download-qr-btn" type="button" disabled>Download QR</button>
      <button id="copy-payload-btn" type="button" disabled>Copy Encrypted Data</button>
    </div>

    <label for="payload-output">Encrypted Share Link</label>
    <textarea id="payload-output" rows="4" readonly></textarea>
  </section>

  <section class="card" aria-labelledby="decrypt-title">
    <h2 id="decrypt-title">Decrypt</h2>

    <div class="row">
      <button id="start-camera-btn" type="button">Start Camera Scan</button>
      <button id="stop-camera-btn" type="button" disabled>Stop Camera</button>
    </div>
    <video id="scanner-video" playsinline muted></video>

    <label for="qr-image-input">Or upload QR image</label>
    <input id="qr-image-input" type="file" accept="image/*" />

    <label for="payload-input">Scanned payload (or link)</label>
    <textarea id="payload-input" rows="4" placeholder="Scan/upload QR or paste a lock link"></textarea>

    <label for="decrypt-passphrase">Passphrase</label>
    <input id="decrypt-passphrase" type="password" autocomplete="off" />

    <button id="decrypt-btn" type="button">Decrypt</button>

    <p class="status" id="decrypt-status" role="status" aria-live="polite"></p>

    <label for="decrypted-output">Decrypted secret</label>
    <textarea id="decrypted-output" rows="4" readonly></textarea>

    <button id="copy-secret-btn" type="button" disabled>Copy Decrypted Secret</button>
  </section>
</div>

<canvas id="scanner-canvas" hidden></canvas>
