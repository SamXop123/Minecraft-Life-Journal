/**
 * Compress an image File in the browser using HTML5 Canvas.
 * Converts large PNG/JPEG files into an optimized JPEG File.
 *
 * @param {File} file - The original image File object.
 * @param {object} [options]
 * @param {number} [options.maxWidth=1920] - Maximum width for resizing.
 * @param {number} [options.maxHeight=1080] - Maximum height for resizing.
 * @param {number} [options.quality=0.85] - Compression quality (0 to 1).
 * @returns {Promise<File>} A compressed File object (or original if small/failed).
 */
export async function compressImage(file, options = {}) {
  if (!file || typeof window === "undefined") return file;

  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85 } = options;

  // Skip compression for small files (< 1MB) or non-standard types like SVG
  if (file.size < 1 * 1024 * 1024 || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const compressedFile = new File([blob], newFileName, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => resolve(file);
    };

    reader.onerror = () => resolve(file);
  });
}
