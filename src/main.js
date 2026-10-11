const imageUpload = document.querySelector("#imageUpload");
const dropZone = document.querySelector("#dropZone");
const sourceColor = document.querySelector("#sourceColor");
const targetColor = document.querySelector("#targetColor");
const sourceHex = document.querySelector("#sourceHex");
const targetHex = document.querySelector("#targetHex");
const thresholdRange = document.querySelector("#thresholdRange");
const smoothnessRange = document.querySelector("#smoothnessRange");
const thresholdValue = document.querySelector("#thresholdValue");
const smoothnessValue = document.querySelector("#smoothnessValue");
const previewCanvas = document.querySelector("#previewCanvas");
const emptyState = document.querySelector("#emptyState");
const applyButton = document.querySelector("#applyButton");
const downloadButton = document.querySelector("#downloadButton");

const ctx = previewCanvas.getContext("2d");
let uploadedImage = null;
let recolorFrame = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rgbFromHex(hex) {
  const sanitized = hex.replace("#", "");
  const n =
    sanitized.length === 3
      ? sanitized
          .split("")
          .map((char) => char + char)
          .join("")
      : sanitized;

  const value = Number.parseInt(n, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function hexFromRgb({ r, g, b }) {
  const toHex = (channel) => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function updateColorLabels() {
  sourceHex.textContent = sourceColor.value.toUpperCase();
  targetHex.textContent = targetColor.value.toUpperCase();
}

function updateRangeLabels() {
  thresholdValue.textContent = thresholdRange.value;
  smoothnessValue.textContent = smoothnessRange.value;
}

function renderBasePreview(image) {
  previewCanvas.width = image.width;
  previewCanvas.height = image.height;

  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.fillStyle = "#f4f0dc";
  ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(image, 0, 0, image.width, image.height);
}

function getAdjustmentWeight(distance, threshold, smoothness) {
  if (threshold <= 0) {
    return 0;
  }

  const falloff = 0.35 + smoothness / 150;
  const normalized = clamp(
    (threshold - distance) / (threshold * falloff),
    0,
    1,
  );
  return normalized;
}

function scheduleRecolor() {
  if (!uploadedImage) {
    return;
  }

  if (recolorFrame) {
    cancelAnimationFrame(recolorFrame);
  }

  recolorFrame = requestAnimationFrame(() => {
    recolorFrame = null;
    applyRecolor();
  });
}

function applyRecolor() {
  if (!uploadedImage) {
    return;
  }

  emptyState.style.display = "none";

  const workingCanvas = document.createElement("canvas");
  const workingCtx = workingCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  const image = uploadedImage;

  workingCanvas.width = image.width;
  workingCanvas.height = image.height;
  workingCtx.drawImage(image, 0, 0, image.width, image.height);

  const imageData = workingCtx.getImageData(0, 0, image.width, image.height);
  const data = imageData.data;
  const source = rgbFromHex(sourceColor.value);
  const target = rgbFromHex(targetColor.value);
  const threshold = Number(thresholdRange.value);
  const smoothness = Number(smoothnessRange.value);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const distance = Math.sqrt(
      (r - source.r) ** 2 + (g - source.g) ** 2 + (b - source.b) ** 2,
    );

    const blend = getAdjustmentWeight(distance, threshold, smoothness);
    if (blend <= 0) {
      continue;
    }

    data[i] = Math.round(r + (target.r - r) * blend);
    data[i + 1] = Math.round(g + (target.g - g) * blend);
    data[i + 2] = Math.round(b + (target.b - b) * blend);
  }

  workingCtx.putImageData(imageData, 0, 0);

  previewCanvas.width = image.width;
  previewCanvas.height = image.height;
  ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.fillStyle = "#f4f0dc";
  ctx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);
  ctx.drawImage(workingCanvas, 0, 0, image.width, image.height);
}

function handleSelectedFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  const img = new Image();
  const url = URL.createObjectURL(file);

  img.onload = () => {
    uploadedImage = img;
    renderBasePreview(img);
    applyRecolor();
    URL.revokeObjectURL(url);
  };

  img.src = url;
}

function handleImageUpload(event) {
  const [file] = event.target.files;
  handleSelectedFile(file);
}

function handleDrop(event) {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
  const [file] = event.dataTransfer.files;
  handleSelectedFile(file);
}

function handleDragOver(event) {
  event.preventDefault();
  dropZone.classList.add("is-dragging");
}

function handleDragLeave(event) {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
}

function downloadImage() {
  if (!uploadedImage) {
    return;
  }

  const link = document.createElement("a");
  link.download = "color-replaced.png";
  link.href = previewCanvas.toDataURL("image/png");
  link.click();
}

sourceColor.addEventListener("input", () => {
  updateColorLabels();
  scheduleRecolor();
});

targetColor.addEventListener("input", () => {
  updateColorLabels();
  scheduleRecolor();
});

thresholdRange.addEventListener("input", () => {
  updateRangeLabels();
  scheduleRecolor();
});

smoothnessRange.addEventListener("input", () => {
  updateRangeLabels();
  scheduleRecolor();
});

imageUpload.addEventListener("change", handleImageUpload);
dropZone.addEventListener("click", () => imageUpload.click());
dropZone.addEventListener("dragover", handleDragOver);
dropZone.addEventListener("dragleave", handleDragLeave);
dropZone.addEventListener("drop", handleDrop);
dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    imageUpload.click();
  }
});
applyButton.addEventListener("click", applyRecolor);
downloadButton.addEventListener("click", downloadImage);

updateColorLabels();
updateRangeLabels();
