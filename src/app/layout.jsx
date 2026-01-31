import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
import UserLoader from "@/store/user.store";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HireHunt.Ai",
  description: "A smart interview management system powered by AI",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({ children }) {
  return (
   <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <ThemeProviderWrapper>
            <UserLoader>
              {children}
              <Toaster />
            </UserLoader>
          </ThemeProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
