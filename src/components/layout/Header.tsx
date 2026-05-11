import { Link, useLocation } from "react-router-dom";
import styles from "./Header.module.css";

export function Header() {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        BEAD STUDIO
      </Link>
      <nav className={styles.nav}>
        <Link
          to="/"
          className={`${styles.navLink} ${location.pathname === "/" ? styles.navLinkActive : ""}`}
        >
          Editor
        </Link>
        <Link
          to="/convert"
          className={`${styles.navLink} ${location.pathname === "/convert" ? styles.navLinkActive : ""}`}
        >
          Convert
        </Link>
      </nav>
    </header>
  );
}
