import { colorMap, TRANSPARENT } from "./beadColors";
import type { GridCell } from "../stores/editorStore";

// export grid as PNG (1 bead = 1 pixel, ready for printing at larger size)
export function exportPNG(
  cells: GridCell[][],
  scale: number = 32, // pixels per bead for print quality
): void {
  const h = cells.length;
  const w = cells[0]?.length ?? 0;

  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d")!;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const code = cells[y][x].color;
      if (code === TRANSPARENT) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x * scale, y * scale, scale, scale);
        continue;
      }
      const c = colorMap.get(code);
      if (c) {
        ctx.fillStyle = `rgb(${c.rgb.join(",")})`;
      } else {
        ctx.fillStyle = "#ffffff";
      }
      // bead with slight round effect
      const margin = scale * 0.08;
      ctx.fillRect(x * scale + margin, y * scale + margin, scale - margin * 2, scale - margin * 2);

      // highlight top
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(
        x * scale + margin,
        y * scale + margin,
        scale - margin * 2,
        (scale - margin * 2) * 0.3,
      );
    }
  }

  // grid lines
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x++) {
    ctx.beginPath();
    ctx.moveTo(x * scale, 0);
    ctx.lineTo(x * scale, h * scale);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * scale);
    ctx.lineTo(w * scale, y * scale);
    ctx.stroke();
  }

  // download
  const link = document.createElement("a");
  link.download = `bead-pattern-${w}x${h}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
