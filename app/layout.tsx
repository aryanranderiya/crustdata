import "./globals.css";
import { Inter } from "next/font/google";
// import { ThemeProvider } from '@/components/theme-provider'
import { NextUIProvider } from "@nextui-org/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "LLM Chat Interface",
  description: "A beautiful chat interface for LLM interactions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextUIProvider>
          {/* <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        > */}
          {children}
          {/* </ThemeProvider> */}
        </NextUIProvider>
      </body>
    </html>
  );
}
