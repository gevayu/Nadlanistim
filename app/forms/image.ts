// Photos picked in the browser, checked and shrunk to a JPEG data URL before they go to WordPress.
// The server takes JPG, PNG or WEBP up to 5MB (wordpress/nadlanistim-auth.php, nadlanistim_auth_store_photo).

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/** `square`: a centered square of that side (profile photo). `maxSide`: the long side capped, proportions kept. */
export function readImage(file: File, size: { square: number } | { maxSide: number }): Promise<string> {
  if (!TYPES.includes(file.type)) return Promise.reject(new Error("אפשר להעלות תמונה מסוג JPG, PNG או WEBP."));
  if (file.size > MAX_IMAGE_BYTES) return Promise.reject(new Error("התמונה גדולה מ-5MB. בחרו תמונה קטנה יותר."));
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      if ("square" in size) {
        const side = Math.min(img.width, img.height);
        canvas.width = canvas.height = size.square;
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size.square, size.square);
      } else {
        const scale = Math.min(1, size.maxSide / Math.max(img.width, img.height));
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      URL.revokeObjectURL(img.src);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("לא הצלחנו לקרוא את התמונה. נסו קובץ JPG או PNG אחר."));
    img.src = URL.createObjectURL(file);
  });
}
