"use client";

import React from "react";
import { ThemeProvider, useTheme } from "./theme-context";
import styles from "./storefront-wrapper.module.css";

function StorefrontContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={styles.storefrontRoot} data-theme={theme}>
      {children}
    </div>
  );
}

export function StorefrontWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StorefrontContent>{children}</StorefrontContent>
    </ThemeProvider>
  );
}
