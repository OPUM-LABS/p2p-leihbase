/**
 * Client-side image resizing and compression utility.
 * Downscales oversized photos (e.g. 4K/8K images) to a maximum dimension
 * before uploading to save storage and bandwidth.
 */

export interface OptimizeOptions {
  /** Maximum width or height in pixels. Default: 1400 */
  maxDimension?: number;
  /** Compression quality between 0.1 and 1.0. Default: 0.85 */
  quality?: number;
  /** Output file name. Default: original file name or generated name */
  filename?: string;
}

export async function resizeAndCompressImage(
  fileOrBlob: Blob | File,
  options: OptimizeOptions = {}
): Promise<File> {
  const { maxDimension = 1400, quality = 0.85 } = options;

  let filename = options.filename;
  if (!filename && fileOrBlob instanceof File) {
    filename = fileOrBlob.name;
  }
  if (!filename) {
    filename = `image_${Date.now()}.jpg`;
  }

  // Ensure filename has .jpg extension if we encode to JPEG
  const baseName = filename.replace(/\.[^/.]+$/, "");
  const outputFileName = `${baseName}.jpg`;

  return new Promise<File>((resolve, reject) => {
    // Create object URL to load image
    const objectUrl = URL.createObjectURL(fileOrBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let originWidth = img.naturalWidth || img.width;
      let originHeight = img.naturalHeight || img.height;

      // Check if image is already within bounds and small enough
      if (
        originWidth <= maxDimension &&
        originHeight <= maxDimension &&
        fileOrBlob.size <= 400 * 1024 &&
        fileOrBlob.type === "image/jpeg"
      ) {
        if (fileOrBlob instanceof File) {
          return resolve(fileOrBlob);
        }
        return resolve(new File([fileOrBlob], outputFileName, { type: "image/jpeg" }));
      }

      // Calculate proportional downscaled dimensions
      let targetWidth = originWidth;
      let targetHeight = originHeight;

      if (originWidth > maxDimension || originHeight > maxDimension) {
        if (originWidth > originHeight) {
          targetHeight = Math.round((originHeight * maxDimension) / originWidth);
          targetWidth = maxDimension;
        } else {
          targetWidth = Math.round((originWidth * maxDimension) / originHeight);
          targetHeight = maxDimension;
        }
      }

      // Draw onto canvas
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get 2D canvas context"));
      }

      // Fill white background (useful for transparent PNGs converted to JPEG)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // High quality smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Convert canvas to JPEG Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Canvas toBlob conversion failed"));
          }
          const optimizedFile = new File([blob], outputFileName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image"));
    };

    img.src = objectUrl;
  });
}
