import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { headers } from "next/headers";
import { isMobile } from "@/lib/functions";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Runnit",
  description: "Runnit",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userAgent = (await headers()).get("user-agent") || "";
  const mobileCheck = isMobile(userAgent);

  if (mobileCheck)
    return (
      <div className="h-screen w-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold">We&apos;re sorry!</h1>
        <br />
        <h2 className="text-xl text-center">
          Mobile view is not available for the OS currently.
        </h2>
      </div>
    );

  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
