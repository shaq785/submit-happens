import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadataBase =
  process.env.NEXT_PUBLIC_SITE_URL != null &&
  process.env.NEXT_PUBLIC_SITE_URL !== ""
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : process.env.VERCEL_URL != null && process.env.VERCEL_URL !== ""
      ? new URL(`https://${process.env.VERCEL_URL}`)
      : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,
  title: "Submit Happens",
  description:
    "From Human Resources: a tap-to-play time-entry drill. Log the week and submit before the patience meter runs out—because apparently we have to.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Submit Happens",
    description:
      "From Human Resources: a tap-to-play time-entry drill. Log the week and submit before the patience meter runs out—because apparently we have to.",
    images: [
      {
        url: "/ogimage.png",
        alt: "Submit Happens — weekly timesheet arcade",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit Happens",
    description:
      "From Human Resources: a tap-to-play time-entry drill. Log the week and submit before the patience meter runs out—because apparently we have to.",
    images: ["/ogimage.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
