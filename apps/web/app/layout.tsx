import type { Metadata, Viewport } from "next";
import { Lato, Montserrat, Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap"
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-poppins",
  display: "swap"
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-roboto",
  display: "swap"
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#377cc0"
};

export const metadata: Metadata = {
  title: "Antares Plataforma",
  description: "Frontend Next.js 14 + Tailwind + shadcn/ui"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const fontVars = [montserrat.variable, poppins.variable, roboto.variable, lato.variable].join(" ");
  return (
    <html lang="es" className={fontVars}>
      <body className="min-h-dvh bg-[rgb(var(--background))] font-body text-[rgb(var(--foreground))] antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
