import type { Metadata } from "next";
import { Share_Tech_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const terminalDisplay = Share_Tech_Mono({
  variable: "--font-terminal-display",
  subsets: ["latin"],
  weight: "400",
});

const terminalMono = JetBrains_Mono({
  variable: "--font-terminal-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BLACKLINE",
  description: "Tablette de gestion de communaute — usage RP, donnees fictives.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${terminalDisplay.variable} ${terminalMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
