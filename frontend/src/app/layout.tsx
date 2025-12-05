import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PortSmith - API Developer Portal",
  description: "Manage and explore APIs for developers with PortSmith",
  icons: {
    icon: "/favicon.ico",
  },
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
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
