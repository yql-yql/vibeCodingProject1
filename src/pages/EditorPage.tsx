import { Toolbar } from "../components/editor/Toolbar";
import { BeadCanvas } from "../components/editor/BeadCanvas";
import { ColorPalette } from "../components/editor/ColorPalette";
import { StatusBar } from "../components/editor/StatusBar";
import { SaveLoadPanel } from "../components/editor/SaveLoadPanel";
import styles from "./EditorPage.module.css";

export function EditorPage() {
  return (
    <div className={styles.page}>
      <div className={styles.body}>
        <Toolbar />
        <BeadCanvas />
      </div>
      <ColorPalette />
      <div className={styles.bottomBar}>
        <SaveLoadPanel />
        <StatusBar />
      </div>
    </div>
  );
}
