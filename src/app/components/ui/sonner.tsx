"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          // richColors defaults are below 4.5:1 contrast (WCAG 1.4.3)
          "--success-text": "#14532d",
          "--error-text": "#7f1d1d",
          "--warning-text": "#713f12",
          "--info-text": "#1e3a8a",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
