import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Préstamos Norte — Gestión multi agencia",
  description: "Sistema web de gestión de préstamos multi sucursal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
