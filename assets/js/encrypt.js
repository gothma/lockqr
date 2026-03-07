(function () {
  var SALT_SIZE = 16;
  var IV_SIZE = 16;
  var PBKDF2_ITERS = 200000;
  var WEBCRYPTO_ERROR =
    "Secure browser cryptography is unavailable. This page must run in a secure context (HTTPS, or localhost).";

  function ensureWebCryptoAvailable() {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error(WEBCRYPTO_ERROR);
    }
  }

  function toBase64(bytes) {
    var binary = "";
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function fromBase64(base64) {
    var binary = atob(base64);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function deriveKey(passphrase, salt) {
    ensureWebCryptoAvailable();

    var keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: salt,
        iterations: PBKDF2_ITERS,
      },
      keyMaterial,
      { name: "AES-CBC", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptSecret(secret, passphrase) {
    ensureWebCryptoAvailable();

    if (!passphrase) {
      throw new Error("Passphrase is required.");
    }

    var salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
    var iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
    var key = await deriveKey(passphrase, salt);

    var ciphertext = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: iv },
      key,
      new TextEncoder().encode(secret)
    );

    var cipherBytes = new Uint8Array(ciphertext);
    var payload = new Uint8Array(SALT_SIZE + IV_SIZE + cipherBytes.length);
    payload.set(salt, 0);
    payload.set(iv, SALT_SIZE);
    payload.set(cipherBytes, SALT_SIZE + IV_SIZE);

    return toBase64(payload);
  }

  async function decryptPayload(payloadB64, passphrase) {
    ensureWebCryptoAvailable();

    if (!passphrase) {
      throw new Error("Passphrase is required.");
    }

    var bytes;
    try {
      bytes = fromBase64(payloadB64.trim());
    } catch (error) {
      throw new Error("Invalid Base64 payload.");
    }

    if (bytes.length <= SALT_SIZE + IV_SIZE) {
      throw new Error("Payload is too short.");
    }

    var salt = bytes.slice(0, SALT_SIZE);
    var iv = bytes.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
    var ciphertext = bytes.slice(SALT_SIZE + IV_SIZE);

    var key = await deriveKey(passphrase, salt);

    try {
      var plaintextBuffer = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv: iv },
        key,
        ciphertext
      );
      return new TextDecoder("utf-8", { fatal: true }).decode(plaintextBuffer);
    } catch (error) {
      throw new Error("Decryption failed. Check passphrase or QR data.");
    }
  }

  window.LockQRCrypto = {
    encryptSecret: encryptSecret,
    decryptPayload: decryptPayload,
  };
})();
