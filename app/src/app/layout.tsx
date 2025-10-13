import type { Metadata } from "next";
import Providers from "@/components/Providers";
import ResponsiveAppBar from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeaLink - Decentralized News Betting",
  description:
    "The first open-ended peer-to-peer news betting protocol on Ethereum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Righteous&family=Spline+Sans+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ResponsiveAppBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
