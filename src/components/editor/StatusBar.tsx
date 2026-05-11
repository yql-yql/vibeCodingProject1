import { useEditorStore } from "../../stores/editorStore";
import styles from "./StatusBar.module.css";

export function StatusBar() {
  const { gridWidth, gridHeight, activeColor, activeTool, zoom, setZoom } =
    useEditorStore();

  return (
    <div className={styles.bar}>
      <span className={styles.item}>
        {gridWidth}x{gridHeight}
      </span>
      <span className={styles.item}>
        Color: {activeColor === "transparent" ? "-" : activeColor}
      </span>
      <span className={styles.item}>
        Tool: {activeTool}
      </span>
      <div className={styles.spacer} />
      <button className={styles.zoomBtn} onClick={() => setZoom(zoom - 4)}>
        -
      </button>
      <span className={styles.item}>{Math.round((zoom / 20) * 100)}%</span>
      <button className={styles.zoomBtn} onClick={() => setZoom(zoom + 4)}>
        +
      </button>
    </div>
  );
}
