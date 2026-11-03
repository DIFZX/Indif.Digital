import type { ReactNode } from "react";
import styles from "./home.module.css";

export function HomeMotion({ children }: { children: ReactNode }) {
  return (
    <div className={styles.intro}>
      {children}
      <div className={styles.motionBar}>
        <span className={styles.motionNote}>Bikin undangan yang kamu banget!</span>
      </div>
    </div>
  );
}
