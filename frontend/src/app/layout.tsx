import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "APISmith - API Developer Portal",
  description: "Manage and explore APIs for developers with APISmith",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "APISmith - API Developer Portal",
    description: "Manage and explore APIs for developers with APISmith",
    images: ["/logo.png"],
    url: "https://apismith.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "APISmith - API Developer Portal",
    description: "Manage and explore APIs for developers with APISmith",
    images: ["/logo.png"],
  },
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
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
