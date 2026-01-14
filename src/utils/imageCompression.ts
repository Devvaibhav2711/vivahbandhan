
/**
 * Compresses an image file using the Browser's Canvas API.
 * 
 * @param file The original image File object.
 * @param quality Quality of the output JPEG image (0.0 to 1.0). Default is 0.7.
 * @param maxWidth Maximum width of the output image. Default is 800px.
 * @returns A Promise that resolves to a compressed File object.
 */
export const compressImage = (
    file: File,
    quality: number = 0.7,
    maxWidth: number = 800
): Promise<File> => {
    return new Promise((resolve, reject) => {
        // 1. Create an image element
        const image = new Image();
        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = (event) => {
            if (event.target?.result) {
                image.src = event.target.result as string;
            }
        };

        reader.onerror = (error) => reject(error);

        image.onload = () => {
            // 2. Calculate new dimensions
            let width = image.width;
            let height = image.height;

            if (width > maxWidth) {
                const ratio = maxWidth / width;
                width = maxWidth;
                height = image.height * ratio;
            }

            // 3. Draw on Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Draw image
            ctx.drawImage(image, 0, 0, width, height);

            // 4. Export as Blob/File
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error("Canvas processing failed"));
                        return;
                    }

                    // Create a new File from the blob, preserving the name but changing type to jpeg
                    // We convert to JPEG for consistent compression support.
                    const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                    const compressedFile = new File([blob], newName, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });

                    resolve(compressedFile);
                },
                "image/jpeg",
                quality
            );
        };

        image.onerror = (error) => reject(error);
    });
};
