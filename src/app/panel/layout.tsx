import type { Metadata } from "next";
import "./panel.css";

// El panel de gestión es privado: nunca debe aparecer en Google.
export const metadata: Metadata = {
  title: "Panel de gestión",
  robots: { index: false, follow: false },
};

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="ag-panel">{children}</div>;
}
