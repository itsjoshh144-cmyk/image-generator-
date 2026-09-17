import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "@/components/image-gen/toast";

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Describe anything. Create an image.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-950 text-zinc-100">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
