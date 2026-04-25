import React, { createContext, useContext, useEffect, useState } from "react";

export type FontSize = "sm" | "md" | "lg" | "xl";

interface AccessibilityContextType {
  fontSize: FontSize;
  highContrast: boolean;
  setFontSize: (size: FontSize) => void;
  toggleHighContrast: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const ORDER: FontSize[] = ["sm", "md", "lg", "xl"];

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "md";
    return (localStorage.getItem("fontSize") as FontSize) || "md";
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("highContrast") === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    ORDER.forEach((s) => root.classList.remove(`text-size-${s}`));
    root.classList.add(`text-size-${fontSize}`);
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");
    localStorage.setItem("highContrast", String(highContrast));
  }, [highContrast]);

  const setFontSize = (size: FontSize) => setFontSizeState(size);

  const increaseFontSize = () => {
    const idx = ORDER.indexOf(fontSize);
    if (idx < ORDER.length - 1) setFontSizeState(ORDER[idx + 1]);
  };

  const decreaseFontSize = () => {
    const idx = ORDER.indexOf(fontSize);
    if (idx > 0) setFontSizeState(ORDER[idx - 1]);
  };

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        highContrast,
        setFontSize,
        toggleHighContrast,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return context;
}
