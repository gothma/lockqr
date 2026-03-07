(function () {
  var scannerState = {
    stream: null,
    rafId: null,
    active: false,
  };

  function setStatus(el, message, isError) {
    el.textContent = message || "";
    el.classList.toggle("error", !!isError);
  }

  function renderQRCode(text, container) {
    container.innerHTML = "";
    new QRCode(container, {
      text: text,
      width: 256,
      height: 256,
      correctLevel: QRCode.CorrectLevel.M,
    });
  }

  function getQRImageDataUrl(container) {
    var canvas = container.querySelector("canvas");
    if (canvas) {
      return canvas.toDataURL("image/png");
    }

    var img = container.querySelector("img");
    if (img && img.src) {
      return img.src;
    }

    return "";
  }

  function stopCamera(video) {
    scannerState.active = false;
    if (scannerState.rafId) {
      cancelAnimationFrame(scannerState.rafId);
      scannerState.rafId = null;
    }

    if (scannerState.stream) {
      scannerState.stream.getTracks().forEach(function (track) {
        track.stop();
      });
      scannerState.stream = null;
    }

    video.srcObject = null;
  }

  async function startCameraScan(opts) {
    var video = opts.video;
    var canvas = opts.canvas;
    var onDecoded = opts.onDecoded;
    var statusEl = opts.statusEl;

    if (!window.isSecureContext) {
      throw new Error("Camera requires a secure context (HTTPS, or localhost).");
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera API is not available in this browser.");
    }

    stopCamera(video);

    var stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
    } catch (error) {
      if (error && error.name === "NotAllowedError") {
        throw new Error("Camera permission was denied. Allow camera access and retry.");
      }
      if (error && error.name === "NotFoundError") {
        throw new Error("No camera was found on this device.");
      }
      throw new Error("Could not access camera. Check browser permissions and retry.");
    }

    scannerState.stream = stream;
    scannerState.active = true;
    video.srcObject = stream;
    try {
      await video.play();
    } catch (error) {
      stopCamera(video);
      throw new Error("Camera preview could not start. Try reloading and granting permissions.");
    }
    setStatus(statusEl, "Scanning for QR code...", false);

    var ctx = canvas.getContext("2d", { willReadFrequently: true });

    function scanFrame() {
      if (!scannerState.active) {
        return;
      }

      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var decoded = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (decoded && decoded.data) {
          onDecoded(decoded.data);
          setStatus(statusEl, "QR code detected.", false);
          stopCamera(video);
          return;
        }
      }

      scannerState.rafId = requestAnimationFrame(scanFrame);
    }

    scannerState.rafId = requestAnimationFrame(scanFrame);
  }

  function decodeQRFromImageFile(file, canvas) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();

      reader.onload = function () {
        var image = new Image();
        image.onload = function () {
          var ctx = canvas.getContext("2d", { willReadFrequently: true });
          canvas.width = image.naturalWidth;
          canvas.height = image.naturalHeight;
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var decoded = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });

          if (!decoded || !decoded.data) {
            reject(new Error("No QR code found in image."));
            return;
          }

          resolve(decoded.data);
        };
        image.onerror = function () {
          reject(new Error("Could not load image file."));
        };
        image.src = String(reader.result);
      };

      reader.onerror = function () {
        reject(new Error("Could not read image file."));
      };

      reader.readAsDataURL(file);
    });
  }

  window.LockQR = {
    renderQRCode: renderQRCode,
    getQRImageDataUrl: getQRImageDataUrl,
    startCameraScan: startCameraScan,
    stopCamera: stopCamera,
    decodeQRFromImageFile: decodeQRFromImageFile,
    setStatus: setStatus,
  };
})();
