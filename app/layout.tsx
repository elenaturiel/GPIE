import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { archivo, instrument, plexMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "INTACTA · Antimanchas para tapicería",
  description:
    "INTACTA protege sofás, sillas y asientos de tela con nanotecnología: lo que se derrama se queda en gotas. Para hoteles, alojamientos turísticos, VTC, hostelería, comercios y casas.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // La CSP lleva un nonce distinto en cada petición: la página se genera al pedirla (no estática).
  await connection();
  return (
    <html lang="es" className={`${archivo.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
