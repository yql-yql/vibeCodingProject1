export interface PixelateOptions {
  targetWidth: number; // output bead grid width
  targetHeight: number; // output bead grid height
}

// downsample an image to bead grid dimensions using average color
export function pixelateImage(
  imageData: ImageData,
  options: PixelateOptions,
): string[][] {
  const { targetWidth, targetHeight } = options;
  const { width: srcW, height: srcH, data } = imageData;

  const grid: string[][] = [];

  const cellW = srcW / targetWidth;
  const cellH = srcH / targetHeight;

  for (let gy = 0; gy < targetHeight; gy++) {
    const row: string[] = [];
    for (let gx = 0; gx < targetWidth; gx++) {
      // sample pixels in this cell and average
      const sx = Math.floor(gx * cellW);
      const sy = Math.floor(gy * cellH);
      const ex = Math.floor((gx + 1) * cellW);
      const ey = Math.floor((gy + 1) * cellH);

      let rSum = 0,
        gSum = 0,
        bSum = 0,
        aSum = 0,
        count = 0;

      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          const idx = (y * srcW + x) * 4;
          rSum += data[idx];
          gSum += data[idx + 1];
          bSum += data[idx + 2];
          aSum += data[idx + 3];
          count++;
        }
      }

      if (count === 0 || aSum / count < 128) {
        row.push("transparent");
      } else {
        const r = Math.round(rSum / count);
        const g = Math.round(gSum / count);
        const b = Math.round(bSum / count);
        row.push(`rgb(${r},${g},${b})`);
      }
    }
    grid.push(row);
  }

  return grid;
}

// load image file and return ImageData
export function loadImageData(file: File): Promise<{
  imageData: ImageData;
  image: HTMLImageElement;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      URL.revokeObjectURL(url);
      resolve({ imageData, image: img });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}
