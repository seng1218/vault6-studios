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

import { useTheme } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeSyncInternal />
      {children}
    </NextThemesProvider>
  );
}

function ThemeSyncInternal() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    
    const isDark = resolvedTheme === "dark";
    const themeColor = isDark ? "#050505" : "#f8fafc";
    
    // 1. Update theme-color meta tag for mobile address bar
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeColor);
    
    // 2. Update color-scheme style on root for system UI consistency
    document.documentElement.style.colorScheme = resolvedTheme;
    
    // 3. Ensure the class is present (next-themes does this, but we reinforce it)
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [resolvedTheme]);

  return null;
}
