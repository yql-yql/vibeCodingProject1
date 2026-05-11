import { useEditorStore } from "../../stores/editorStore";
import { colorFamilies, TRANSPARENT, colorMap } from "../../utils/beadColors";
import { useState } from "react";
import styles from "./ColorPalette.module.css";

export function ColorPalette() {
  const { activeColor, setActiveColor } = useEditorStore();
  const [expandedFamily, setExpandedFamily] = useState<string | null>("Pink / Rose");

  return (
    <div className={styles.palette}>
      <button
        className={`${styles.swatch} ${activeColor === TRANSPARENT ? styles.swatchActive : ""}`}
        onClick={() => setActiveColor(TRANSPARENT)}
        title="Eraser"
      >
        <div className={styles.eraserSwatch} />
      </button>

      {colorFamilies.map((family) => (
        <div key={family.name} className={styles.family}>
          <button
            className={`${styles.familyTab} ${
              expandedFamily === family.name ? styles.familyTabOpen : ""
            }`}
            onClick={() =>
              setExpandedFamily(expandedFamily === family.name ? null : family.name)
            }
          >
            {family.name}
          </button>

          {expandedFamily === family.name && (
            <div className={styles.colorRow}>
              {family.codes.map((code) => {
                const c = colorMap.get(code)!;
                return (
                  <button
                    key={code}
                    className={`${styles.swatch} ${activeColor === code ? styles.swatchActive : ""}`}
                    onClick={() => setActiveColor(code)}
                    title={`${code} ${c.name}`}
                  >
                    <div
                      className={styles.swatchColor}
                      style={{ background: `rgb(${c.rgb.join(",")})` }}
                    />
                    <span className={styles.swatchCode}>{code}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
