import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond } from "next/font/google";
import { ThemeProvider } from "@/presentation/components/shared/ThemeProvider";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: {
    default: "Master Touch",
    template: "%s | Master Touch",
  },
  description:
    "Electromechanical works, architectural finishing, and smart solutions in Saudi Arabia.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
