import type { Metadata } from "next";
import { Special_Elite, Inter } from "next/font/google";
import "./globals.css";

const dossierDisplay = Special_Elite({
  variable: "--font-dossier-display",
  subsets: ["latin"],
  weight: "400",
});

const dossierSans = Inter({
  variable: "--font-dossier-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blackbook",
  description: "Carnet personnel — usage prive, hors-RP.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${dossierDisplay.variable} ${dossierSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
