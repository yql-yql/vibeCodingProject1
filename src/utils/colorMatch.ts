import { artkalColors, type BeadColor } from "./beadColors";

// find closest bead color by euclidean RGB distance
export function findClosestBeadColor(
  r: number,
  g: number,
  b: number,
  palette: BeadColor[] = artkalColors,
): BeadColor {
  let minDist = Infinity;
  let closest = palette[0];

  for (const color of palette) {
    const [cr, cg, cb] = color.rgb;
    const dist = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }

  return closest;
}

// quantize an array of RGB pixels to the closest bead colors
export function quantizeToBeadColors(
  pixels: Uint8ClampedArray,
  palette: BeadColor[] = artkalColors,
): string[] {
  const result: string[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    if (a < 128) {
      result.push("transparent");
    } else {
      result.push(findClosestBeadColor(r, g, b, palette).code);
    }
  }
  return result;
}
