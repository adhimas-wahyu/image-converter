const upload = document.getElementById("upload");
const preview = document.getElementById("preview");
const format = document.getElementById("format");
const convertBtn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");
const dropzone = document.getElementById("dropzone");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");

let originalWidth = 0;
let originalHeight = 0;

// --- Helper: Handle Aspect Ratio ---
const calculateDimension = (val, isWidth) => {
    if (!originalWidth || !originalHeight) return;
    const ratio = originalWidth / originalHeight;
    if (isWidth) {
        heightInput.value = Math.round(val / ratio);
    } else {
        widthInput.value = Math.round(val * ratio);
    }
};

widthInput.addEventListener("input", () =>
    calculateDimension(widthInput.value, true),
);
heightInput.addEventListener("input", () =>
    calculateDimension(heightInput.value, false),
);

// --- UI Toggle Logic ---
const showPreview = (file) => {
    const objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.style.display = "block";
    dropzone.classList.add("hidden");

    // Load image to get original dimensions
    const img = new Image();
    img.src = objectUrl;
    img.onload = () => {
        originalWidth = img.width;
        originalHeight = img.height;
        widthInput.value = originalWidth;
        heightInput.value = originalHeight;
        URL.revokeObjectURL(objectUrl);
    };
};

const hidePreview = () => {
    upload.value = "";
    preview.src = "#";
    preview.style.display = "none";
    dropzone.classList.remove("hidden");
    widthInput.value = "";
    heightInput.value = "";
};

// --- Conversion Logic ---
const convertImage = async (file, type) => {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");

    const targetWidth = parseInt(widthInput.value) || bitmap.width;
    const targetHeight = parseInt(heightInput.value) || bitmap.height;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (type === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
    bitmap.close();
    return new Promise((resolve) => canvas.toBlob(resolve, type, 0.9));
};

// --- Execution ---
convertBtn.addEventListener("click", async () => {
    const file = upload.files[0];
    if (!file) return alert("Please select an image first.");

    convertBtn.disabled = true;
    convertBtn.textContent = "Converting...";

    try {
        const blob = await convertImage(file, format.value);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `resized-${file.name.split(".")[0]}.${format.value.split("/")[1]}`;
        link.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        alert("Conversion failed.");
    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = "Convert & Download";
    }
});

// --- Listeners ---
upload.addEventListener("change", (e) => {
    if (e.target.files[0]) showPreview(e.target.files[0]);
});
dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) {
        upload.files = e.dataTransfer.files;
        showPreview(e.dataTransfer.files[0]);
    }
});
clearBtn.addEventListener("click", hidePreview);
