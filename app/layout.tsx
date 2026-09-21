import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tekzow — Online MCQ Examination & Certificate Portal",
  description:
    "Secure online examination, automated evaluation, and professional certificate portal powered by Tekzow.",
  icons: {
    icon: "/images/tekzow-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
