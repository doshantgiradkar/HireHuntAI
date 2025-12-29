import "./globals.css";
import { ThemeProviderWrapper } from "@/components/theme-provider-wrapper";
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
  description: "A smart interview management system powerd by AI",
};

export default function RootLayout({ children }) {
  return (
   <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <ThemeProviderWrapper>
            {children}
          </ThemeProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
