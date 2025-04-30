import type React from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { HierarchyProvider } from "@/contexts/hierarchy-context";
import AmplifyClientSide from "@/components/AmplifyClient";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Poker League Management",
  description: "Manage poker leagues, tournaments, and player rankings",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${roboto.className} ${roboto.variable}`}>
        <AmplifyClientSide>
          <ThemeProvider attribute="class" defaultTheme="light">
            <HierarchyProvider>
              <main className="flex-1 overflow-y-auto">{children}</main>
            </HierarchyProvider>
          </ThemeProvider>
        </AmplifyClientSide>
      </body>
    </html>
  );
}
