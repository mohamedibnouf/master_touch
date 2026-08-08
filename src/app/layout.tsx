import type { Metadata, Viewport } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { getLocale } from "next-intl/server";
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
  colorScheme: "light",
  themeColor: "#f4f6f9",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let lang = "ar";
  try {
    lang = await getLocale();
  } catch {
    lang = "ar";
  }

  return (
    <html lang={lang} className="light" style={{ colorScheme: "light" }} suppressHydrationWarning>
      <body className={`${outfit.variable} ${sourceSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
