import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useEditorStore } from "../stores/editorStore";
import { loadImageData, pixelateImage } from "../utils/pixelate";
import { findClosestBeadColor } from "../utils/colorMatch";
import { colorMap, TRANSPARENT, type BeadColor } from "../utils/beadColors";
import { useNavigate } from "react-router-dom";
import styles from "./ConverterPage.module.css";

const PREVIEW_ZOOM = 22;

export function ConverterPage() {
  const [previewGrid, setPreviewGrid] = useState<string[][] | null>(null);
  const [targetW, setTargetW] = useState(29);
  const [targetH, setTargetH] = useState(29);
  const [status, setStatus] = useState("");
  const [originalDataUrl, setOriginalDataUrl] = useState<string | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const loadGrid = useEditorStore((s) => s.loadGrid);
  const navigate = useNavigate();

  // collect used colors from preview grid
  const usedColors = useMemo<BeadColor[]>(() => {
    if (!previewGrid) return [];
    const codes = new Set<string>();
    for (const row of previewGrid) {
      for (const code of row) {
        if (code !== TRANSPARENT) codes.add(code);
      }
    }
    return [...codes].map((c) => colorMap.get(c)!).filter(Boolean);
  }, [previewGrid]);

  const handleFile = useCallback(
    async (file: File) => {
      setStatus("Loading...");
      try {
        const { imageData, image } = await loadImageData(file);

        const origCanvas = document.createElement("canvas");
        origCanvas.width = image.width;
        origCanvas.height = image.height;
        const origCtx = origCanvas.getContext("2d")!;
        origCtx.drawImage(image, 0, 0);
        setOriginalDataUrl(origCanvas.toDataURL());

        const autoH = Math.round((targetW / image.width) * image.height);
        const actualH = targetH || autoH;

        const rawGrid = pixelateImage(imageData, {
          targetWidth: targetW,
          targetHeight: actualH,
        });

        const beadGrid = rawGrid.map((row) =>
          row.map((cell) => {
            if (cell === TRANSPARENT) return TRANSPARENT;
            const match = cell.match(/rgb\((\d+),(\d+),(\d+)\)/);
            if (!match) return TRANSPARENT;
            return findClosestBeadColor(+match[1], +match[2], +match[3]).code;
          }),
        );

        setTargetH(actualH);
        setPreviewGrid(beadGrid);
        setStatus(`Done! ${beadGrid[0].length} x ${beadGrid.length} beads`);
      } catch {
        setStatus("Error loading image");
      }
    },
    [targetW, targetH],
  );

  // draw preview with color code labels
  useEffect(() => {
    if (!previewGrid) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const zoom = PREVIEW_ZOOM;
    const h = previewGrid.length;
    const w = previewGrid[0]?.length ?? 0;
    const labelH = zoom * 0.32;

    canvas.width = w * zoom;
    canvas.height = h * zoom;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const code = previewGrid[y][x];
        if (code === TRANSPARENT) continue;
        const c = colorMap.get(code);
        if (!c) continue;

        const px = x * zoom + 1;
        const py = y * zoom + 1;
        const size = zoom - 2;

        ctx.fillStyle = `rgb(${c.rgb.join(",")})`;
        ctx.fillRect(px, py, size, size);

        // bead highlight
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillRect(px, py, size, size * 0.3);

        // label background
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(px, py + size - labelH, size, labelH);

        // code text — use Arial for clarity
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.max(7, zoom * 0.26)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(code, px + size / 2, py + size - labelH / 2);
      }
    }

    // grid lines
    ctx.strokeStyle = "#2a1540";
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= w; x++) {
      ctx.beginPath();
      ctx.moveTo(x * zoom, 0);
      ctx.lineTo(x * zoom, h * zoom);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * zoom);
      ctx.lineTo(w * zoom, y * zoom);
      ctx.stroke();
    }
  }, [previewGrid]);

  const handleSendToEditor = () => {
    if (!previewGrid) return;
    loadGrid(previewGrid.map((row) => row.map((color) => ({ color }))));
    navigate("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <h2 className={styles.title}>IMAGE TO BEADS</h2>
        <p className={styles.hint}>Upload an image, convert to fuse bead pattern</p>

        <label className={`btn btn--purple ${styles.fileLabel}`}>
          CHOOSE IMAGE
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>

        <div className={styles.settings}>
          <label className={styles.label}>
            Width:{" "}
            <input
              type="number"
              value={targetW}
              onChange={(e) => setTargetW(Math.max(1, Math.min(200, +e.target.value)))}
              min={1}
              max={200}
            />
          </label>
          <label className={styles.label}>
            Height:{" "}
            <input
              type="number"
              value={targetH}
              onChange={(e) => setTargetH(Math.max(1, Math.min(200, +e.target.value)))}
              min={1}
              max={200}
            />
          </label>
        </div>

        <p className={styles.status}>{status}</p>

        {previewGrid && (
          <button className={`btn btn--mint ${styles.sendBtn}`} onClick={handleSendToEditor}>
            OPEN IN EDITOR
          </button>
        )}
      </div>

      <div className={styles.resultArea}>
        <div className={styles.previewRow}>
          {originalDataUrl && (
            <div className={styles.previewPanel}>
              <div className={styles.previewLabel}>ORIGINAL</div>
              <img src={originalDataUrl} alt="Original" className={styles.previewImg} />
            </div>
          )}

          {previewGrid && (
            <div className={styles.previewPanel}>
              <div className={styles.previewLabel}>BEAD PATTERN</div>
              <canvas ref={previewCanvasRef} className={styles.previewCanvas} />
            </div>
          )}
        </div>

        {usedColors.length > 0 && (
          <div className={styles.colorLegend}>
            <div className={styles.legendTitle}>USED COLORS</div>
            <div className={styles.legendRow}>
              {usedColors.map((c) => (
                <div key={c.code} className={styles.legendItem}>
                  <div
                    className={styles.legendSwatch}
                    style={{ background: `rgb(${c.rgb.join(",")})` }}
                  />
                  <span className={styles.legendCode}>{c.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
