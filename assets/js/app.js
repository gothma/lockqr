(function () {
  var ui = {
    secretInput: document.getElementById("secret-input"),
    encryptPassphrase: document.getElementById("encrypt-passphrase"),
    encryptBtn: document.getElementById("encrypt-btn"),
    encryptStatus: document.getElementById("encrypt-status"),
    qrContainer: document.getElementById("qr-container"),
    downloadQrBtn: document.getElementById("download-qr-btn"),
    copyPayloadBtn: document.getElementById("copy-payload-btn"),
    payloadOutput: document.getElementById("payload-output"),

    startCameraBtn: document.getElementById("start-camera-btn"),
    stopCameraBtn: document.getElementById("stop-camera-btn"),
    scannerVideo: document.getElementById("scanner-video"),
    scannerCanvas: document.getElementById("scanner-canvas"),
    qrImageInput: document.getElementById("qr-image-input"),
    payloadInput: document.getElementById("payload-input"),
    decryptPassphrase: document.getElementById("decrypt-passphrase"),
    decryptBtn: document.getElementById("decrypt-btn"),
    decryptStatus: document.getElementById("decrypt-status"),
    decryptedOutput: document.getElementById("decrypted-output"),
    copySecretBtn: document.getElementById("copy-secret-btn"),
  };

  function clearTextForSecurity(el) {
    el.value = "";
  }

  async function copyText(text, statusEl) {
    if (!text) {
      LockQR.setStatus(statusEl, "Nothing to copy yet.", true);
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      LockQR.setStatus(statusEl, "Copied to clipboard.", false);
    } catch (error) {
      LockQR.setStatus(statusEl, "Copy failed in this browser context.", true);
    }
  }

  ui.encryptBtn.addEventListener("click", async function () {
    LockQR.setStatus(ui.encryptStatus, "", false);

    var secret = ui.secretInput.value;
    var passphrase = ui.encryptPassphrase.value;

    if (!secret.trim()) {
      LockQR.setStatus(ui.encryptStatus, "Secret cannot be empty.", true);
      return;
    }

    if (!passphrase) {
      LockQR.setStatus(ui.encryptStatus, "Passphrase is required.", true);
      return;
    }

    try {
      var payload = await LockQRCrypto.encryptSecret(secret, passphrase);
      ui.payloadOutput.value = payload;
      LockQR.renderQRCode(payload, ui.qrContainer);
      ui.downloadQrBtn.disabled = false;
      ui.copyPayloadBtn.disabled = false;
      LockQR.setStatus(ui.encryptStatus, "Encrypted successfully.", false);

      clearTextForSecurity(ui.secretInput);
      clearTextForSecurity(ui.encryptPassphrase);
    } catch (error) {
      LockQR.setStatus(ui.encryptStatus, error.message || "Encryption failed.", true);
    }
  });

  ui.downloadQrBtn.addEventListener("click", function () {
    var dataUrl = LockQR.getQRImageDataUrl(ui.qrContainer);
    if (!dataUrl) {
      LockQR.setStatus(ui.encryptStatus, "No QR code to download.", true);
      return;
    }

    var link = document.createElement("a");
    link.href = dataUrl;
    link.download = "lockqr.png";
    link.click();
  });

  ui.copyPayloadBtn.addEventListener("click", function () {
    copyText(ui.payloadOutput.value, ui.encryptStatus);
  });

  ui.startCameraBtn.addEventListener("click", async function () {
    LockQR.setStatus(ui.decryptStatus, "Requesting camera access...", false);

    var timeoutId = setTimeout(function () {
      LockQR.setStatus(
        ui.decryptStatus,
        "Camera startup is taking too long. Check permissions and HTTPS, then retry.",
        true
      );
    }, 8000);

    try {
      await LockQR.startCameraScan({
        video: ui.scannerVideo,
        canvas: ui.scannerCanvas,
        statusEl: ui.decryptStatus,
        onDecoded: function (payload) {
          ui.payloadInput.value = payload;
          ui.stopCameraBtn.disabled = true;
        },
      });
      clearTimeout(timeoutId);
      ui.stopCameraBtn.disabled = false;
    } catch (error) {
      clearTimeout(timeoutId);
      LockQR.setStatus(ui.decryptStatus, error.message || "Could not start camera.", true);
      ui.stopCameraBtn.disabled = true;
    }
  });

  ui.stopCameraBtn.addEventListener("click", function () {
    LockQR.stopCamera(ui.scannerVideo);
    ui.stopCameraBtn.disabled = true;
    LockQR.setStatus(ui.decryptStatus, "Camera stopped.", false);
  });

  ui.qrImageInput.addEventListener("change", async function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    try {
      var payload = await LockQR.decodeQRFromImageFile(file, ui.scannerCanvas);
      ui.payloadInput.value = payload;
      LockQR.setStatus(ui.decryptStatus, "QR image decoded.", false);
    } catch (error) {
      LockQR.setStatus(ui.decryptStatus, error.message || "Failed to decode image.", true);
    }
  });

  ui.decryptBtn.addEventListener("click", async function () {
    LockQR.setStatus(ui.decryptStatus, "", false);
    ui.decryptedOutput.value = "";
    ui.copySecretBtn.disabled = true;

    var payload = ui.payloadInput.value;
    var passphrase = ui.decryptPassphrase.value;

    if (!payload.trim()) {
      LockQR.setStatus(ui.decryptStatus, "Payload is required.", true);
      return;
    }

    if (!passphrase) {
      LockQR.setStatus(ui.decryptStatus, "Passphrase is required.", true);
      return;
    }

    try {
      var secret = await LockQRCrypto.decryptPayload(payload, passphrase);
      ui.decryptedOutput.value = secret;
      ui.copySecretBtn.disabled = false;
      LockQR.setStatus(ui.decryptStatus, "Decrypted successfully.", false);

      clearTextForSecurity(ui.decryptPassphrase);
    } catch (error) {
      LockQR.setStatus(ui.decryptStatus, error.message || "Decryption failed.", true);
    }
  });

  ui.copySecretBtn.addEventListener("click", function () {
    copyText(ui.decryptedOutput.value, ui.decryptStatus);
  });

  window.addEventListener("beforeunload", function () {
    LockQR.stopCamera(ui.scannerVideo);
  });
})();
