import type { Metadata, Viewport } from "next";
import { Syne, Source_Sans_3 } from "next/font/google";
import { ThemeProvider } from "@/presentation/components/shared/ThemeProvider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/presentation/components/shared/theme-bootstrap";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["500", "600", "700", "800"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Master Touch",
    template: "%s | Master Touch",
  },
  description:
    "Electromechanical works, architectural finishing, and smart solutions in Saudi Arabia.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://www.mastertouchksa.com"),
  icons: {
    icon: [{ url: "/images/logo-master-touch.png", type: "image/png" }],
    apple: [{ url: "/images/logo-master-touch.png" }],
    shortcut: ["/images/logo-master-touch.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <script
          id="mt-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${syne.variable} ${sourceSans.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
