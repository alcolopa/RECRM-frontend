/**
 * Compresses an image file by resizing it and reducing quality.
 * 
 * @param file The image file to compress
 * @param maxWidth The maximum width of the resulting image
 * @param maxHeight The maximum height of the resulting image
 * @param quality The quality of the resulting image (0.0 to 1.0)
 * @returns A promise that resolves to the compressed File
 */
export const compressImage = async (
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.8
): Promise<File> => {
  // Only compress images
  if (!file.type.startsWith('image/')) {
    return file;
  }

  // If the file is already small (e.g., < 200KB), don't compress
  if (file.size < 200 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file); // Fallback to original if canvas context fails
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

/**
 * Creates an object URL for a file and returns it.
 * This is a helper to manage object URLs.
 */
export const createImageUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

/**
 * Revokes an object URL to free up memory.
 */
export const revokeImageUrl = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};
