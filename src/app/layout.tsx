import type { Metadata, Viewport } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "@/presentation/components/shared/ThemeProvider";
import { THEME_BOOTSTRAP_SCRIPT } from "@/presentation/components/shared/theme-bootstrap";
import "./globals.css";

const outfit = Outfit({
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
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/images/logo-master-touch.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
    shortcut: ["/icon.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let lang = "ar";
  try {
    lang = await getLocale();
  } catch {
    lang = "ar";
  }

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          id="mt-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body className={`${outfit.variable} ${sourceSans.variable} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
