"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * WORKAROUND: React 19 + next-themes Script Tag Error
 * next-themes injects an inline script to prevent theme flickering, 
 * which triggers a React 19 warning/error during client-side rendering.
 * This block suppresses that specific error to prevent dev-mode overlays.
 */
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === "string" && 
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Sync theme-color meta tag for mobile browsers
  React.useEffect(() => {
    const root = window.document.documentElement;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const isDark = root.classList.contains("dark");
          const themeColor = isDark ? "#050505" : "#f8fafc";
          
          // Update meta tag
          let meta = document.querySelector('meta[name="theme-color"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'theme-color');
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', themeColor);
          
          // Force color-scheme for browser-level UI consistency
          root.style.colorScheme = isDark ? "dark" : "light";
        }
      });
    });

    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
