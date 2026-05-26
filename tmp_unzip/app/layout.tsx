import type {Metadata} from 'next';
import { Inter, Playfair_Display } from "next/font/google";
import './globals.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: 'Our Restaurant Partners | Celebrate Festival',
  description: 'Trusted by Restaurants Across the U.S.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} bg-[#f3f3f3] text-[#121212] antialiased`} suppressHydrationWarning>{children}</body>
    </html>
  );
}
