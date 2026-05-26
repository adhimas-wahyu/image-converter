const upload = document.getElementById("upload");
const preview = document.getElementById("preview");
const format = document.getElementById("format");
const btn = document.getElementById("convertBtn");
const clearBtn = document.getElementById("clearBtn");

// Preview image logic
upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});

// Clear button logic
clearBtn.addEventListener("click", () => {
  upload.value = "";
  preview.src = "#";
  preview.style.display = "none";
});

// Conversion logic
btn.addEventListener("click", async () => {
  const file = upload.files[0];
  if (!file) {
    alert("Please select an image file first.");
    return;
  }

  // Disable button during processing
  btn.disabled = true;
  btn.textContent = "Converting...";

  try {
    const originalName =
      file.name.substring(0, file.name.lastIndexOf(".")) || "image";

    // We use a Promise to handle the image loading and canvas drawing
    const blob = await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onerror = () => reject(new Error("Failed to read the file."));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () =>
          reject(new Error("Invalid image format or corrupted file."));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");

          if (format.value === "image/jpeg") {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(resolve, format.value, 0.9);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    if (!blob) throw new Error("Conversion failed. Try a different format.");

    // Trigger download
    const url = URL.createObjectURL(blob);
    const ext =
      format.value === "image/avif" ? "avif" : format.value.split("/")[1];
    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName}-converted.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Conversion Error:", error);
    alert("Error: " + error.message);
  } finally {
    // Reset button state
    btn.disabled = false;
    btn.textContent = "Convert & Download";
  }
});
