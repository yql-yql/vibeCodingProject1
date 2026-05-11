import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { colorMap, TRANSPARENT } from "../../utils/beadColors";
import styles from "./BeadCanvas.module.css";

export function BeadCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    gridWidth, gridHeight, cells, zoom,
    activeTool, activeColor,
    setCell, fillArea, setActiveColor,
  } = useEditorStore();

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const totalW = gridWidth * zoom;
    const totalH = gridHeight * zoom;
    canvas.width = totalW;
    canvas.height = totalH;

    // background
    ctx.fillStyle = "#1a0d2e";
    ctx.fillRect(0, 0, totalW, totalH);

    // cells
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cell = cells[y]?.[x];
        const color = cell?.color ?? TRANSPARENT;

        if (color !== TRANSPARENT) {
          const bead = colorMap.get(color);
          const px = x * zoom + 1;
          const py = y * zoom + 1;
          const size = zoom - 2;

          if (bead) {
            const [r, g, b] = bead.rgb;
            ctx.fillStyle = `rgb(${r},${g},${b})`;
          } else {
            ctx.fillStyle = color;
          }
          ctx.fillRect(px, py, size, size);

          // highlight to simulate bead roundness
          if (zoom >= 10) {
            ctx.fillStyle = "rgba(255,255,255,0.25)";
            ctx.fillRect(px, py, size, size * 0.35);
            ctx.fillStyle = "rgba(0,0,0,0.12)";
            ctx.fillRect(px, py + size * 0.6, size, size * 0.4);
          }

          // color code label at bottom of cell
          if (zoom >= 13 && bead) {
            const labelH = Math.max(zoom * 0.35, 9);
            // semi-transparent dark label background
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            ctx.fillRect(px, py + size - labelH, size, labelH);
            // bright code text
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(7, zoom * 0.28)}px "Fira Code", monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(bead.code, px + size / 2, py + size - labelH / 2);
          }
        }
      }
    }

    // grid lines
    ctx.strokeStyle = "#2a1540";
    ctx.lineWidth = 1;
    for (let x = 0; x <= gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * zoom, 0);
      ctx.lineTo(x * zoom, totalH);
      ctx.stroke();
    }
    for (let y = 0; y <= gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * zoom);
      ctx.lineTo(totalW, y * zoom);
      ctx.stroke();
    }
  }, [cells, gridWidth, gridHeight, zoom]);

  const getCellFromEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): [number, number] | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / zoom);
      const y = Math.floor((e.clientY - rect.top) / zoom);
      if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return null;
      return [x, y];
    },
    [zoom, gridWidth, gridHeight],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getCellFromEvent(e);
      if (!pos) return;
      const [x, y] = pos;

      if (activeTool === "pen") {
        setCell(x, y, activeColor);
      } else if (activeTool === "eraser") {
        setCell(x, y, TRANSPARENT);
      } else if (activeTool === "eyedropper") {
        const color = cells[y]?.[x]?.color ?? TRANSPARENT;
        if (color !== TRANSPARENT) {
          setActiveColor(color);
        }
      } else if (activeTool === "fill") {
        fillArea(x, y, activeColor);
      }
    },
    [activeTool, activeColor, cells, getCellFromEvent, setCell, fillArea, setActiveColor],
  );

  const isDrawing = useRef(false);

  const handleMouseDownDrag = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDrawing.current = true;
      handleMouseDown(e);
    },
    [handleMouseDown],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing.current) return;
      if (activeTool !== "pen" && activeTool !== "eraser") return;
      const pos = getCellFromEvent(e);
      if (!pos) return;
      const [x, y] = pos;
      const color = activeTool === "eraser" ? TRANSPARENT : activeColor;
      setCell(x, y, color);
    },
    [activeTool, activeColor, getCellFromEvent, setCell],
  );

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  return (
    <div className={styles.canvasWrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDownDrag}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: activeTool === "eyedropper" ? "crosshair" : "pointer" }}
      />
    </div>
  );
}
