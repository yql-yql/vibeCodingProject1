import { useEditorStore, type Tool } from "../../stores/editorStore";
import styles from "./Toolbar.module.css";

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: "pen", label: "Pen", icon: "X" },
  { id: "eraser", label: "Eraser", icon: "E" },
  { id: "eyedropper", label: "Pick", icon: "C" },
  { id: "fill", label: "Fill", icon: "F" },
];

export function Toolbar() {
  const { activeTool, setActiveTool, undo, redo } = useEditorStore();

  return (
    <div className={styles.toolbar}>
      {tools.map((t) => (
        <button
          key={t.id}
          className={`${styles.toolBtn} ${activeTool === t.id ? styles.toolBtnActive : ""}`}
          onClick={() => setActiveTool(t.id)}
          title={t.label}
        >
          {t.icon}
          <span className={styles.toolLabel}>{t.label}</span>
        </button>
      ))}

      <div className={styles.separator} />

      <button className={styles.toolBtn} onClick={undo} title="Undo">
        {"<-"}
        <span className={styles.toolLabel}>Undo</span>
      </button>
      <button className={styles.toolBtn} onClick={redo} title="Redo">
        {"->"}
        <span className={styles.toolLabel}>Redo</span>
      </button>
    </div>
  );
}
