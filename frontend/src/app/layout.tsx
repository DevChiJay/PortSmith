import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/OfflineBanner";
import "./globals.css";
import dynamic from "next/dynamic";


// Only import analytics in production
const GoogleAnalytics = dynamic(() => 
  process.env.NODE_ENV === "production" 
    ? import("@/components/Landing/google-analytics").then(mod => mod.GoogleAnalytics)
    : Promise.resolve(() => null)
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PortSmith - API Developer Portal & Gateway",
    template: "%s | PortSmith",
  },
  description: "Unified API gateway and developer portal. Manage, explore, and integrate APIs seamlessly with advanced rate limiting, analytics, and comprehensive documentation.",
  keywords: [
    "API gateway",
    "API portal",
    "API management",
    "developer portal",
    "API integration",
    "API documentation",
    "rate limiting",
    "API analytics",
    "API keys",
    "REST API",
    "API catalog",
    "API developer tools",
  ],
  authors: [{ name: "PortSmith Team" }],
  creator: "PortSmith",
  publisher: "PortSmith",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "PortSmith - API Developer Portal & Gateway",
    description:
      "Unified API gateway and developer portal. Manage, explore, and integrate APIs seamlessly with advanced rate limiting and analytics.",
    url: "/",
    siteName: "PortSmith",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PortSmith - API Developer Portal & Gateway",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PortSmith - API Developer Portal & Gateway",
    description:
      "Unified API gateway and developer portal. Manage, explore, and integrate APIs seamlessly with advanced rate limiting and analytics.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PortSmith",
  },
};

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
];

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
      </head>
      <body className={inter.className}>
        {process.env.NODE_ENV === "production" && <GoogleAnalytics />}
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <OfflineBanner />
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
