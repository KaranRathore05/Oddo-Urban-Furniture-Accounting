import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urban Furniture — Accounting System",
  description: "Lightweight accounting system for Urban Furniture. Manage contacts, products, purchases, sales, and generate financial reports automatically.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
