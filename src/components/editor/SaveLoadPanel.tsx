import { useState, useEffect } from "react";
import { useEditorStore } from "../../stores/editorStore";
import { db, type SavedProject } from "../../utils/db";
import { exportPNG } from "../../utils/export";
import styles from "./SaveLoadPanel.module.css";

export function SaveLoadPanel() {
  const { cells, gridWidth, gridHeight, loadGrid } = useEditorStore();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [showLoad, setShowLoad] = useState(false);

  const refreshProjects = async () => {
    const all = await db.projects.orderBy("updatedAt").reverse().toArray();
    setProjects(all);
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const handleSave = async () => {
    const name = prompt("Project name:", `Pattern-${gridWidth}x${gridHeight}`);
    if (!name) return;

    await db.projects.add({
      name,
      gridWidth,
      gridHeight,
      cells: cells.map((row) => row.map((c) => ({ color: c.color }))),
      updatedAt: new Date().toISOString(),
    });

    await refreshProjects();
  };

  const handleLoad = (project: SavedProject) => {
    const grid = project.cells.map((row) =>
      row.map((c) => ({ color: c.color })),
    );
    loadGrid(grid);
    setShowLoad(false);
  };

  const handleDelete = async (id: number) => {
    await db.projects.delete(id);
    await refreshProjects();
  };

  const handleExport = () => {
    exportPNG(cells, 32);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.actions}>
        <button className={styles.btn} onClick={handleSave}>
          SAVE
        </button>
        <button
          className={`${styles.btn} ${showLoad ? styles.btnActive : ""}`}
          onClick={() => {
            setShowLoad(!showLoad);
            refreshProjects();
          }}
        >
          LOAD
        </button>
        <button className={styles.btn} onClick={handleExport}>
          PNG
        </button>
      </div>

      {showLoad && (
        <div className={styles.loadList}>
          {projects.length === 0 ? (
            <p className={styles.empty}>No saved projects</p>
          ) : (
            projects.map((p) => (
              <div key={p.id!} className={styles.projectItem}>
                <button
                  className={styles.projectBtn}
                  onClick={() => handleLoad(p)}
                >
                  <span className={styles.projectName}>{p.name}</span>
                  <span className={styles.projectMeta}>
                    {p.gridWidth}x{p.gridHeight} — {new Date(p.updatedAt).toLocaleDateString()}
                  </span>
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(p.id!)}
                >
                  X
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
