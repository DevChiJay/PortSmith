import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { OfflineBanner } from "@/components/OfflineBanner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "PortSmith - API Developer Portal",
  description: "Manage and explore APIs for developers with PortSmith",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "PortSmith - API Developer Portal",
    description: "Manage and explore APIs for developers with PortSmith",
    images: ["/logo.png"],
    url: "https://portsmith.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortSmith - API Developer Portal",
    description: "Manage and explore APIs for developers with PortSmith",
    images: ["/logo.png"],
  },
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
      <body className={inter.className}>
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
