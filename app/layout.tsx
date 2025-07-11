import { Geist, Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Providers from "./providers";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "SneakLab - Sua loja online de streetwear.",
  description: "Sneakers, Calças, Camisetas, Jaquetas e tudo em streetwear você encontra aqui.",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

const monserrat = Montserrat({
    display: "swap",
    subsets: ["latin"],
    variable: "--font-montserrat",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={monserrat.className} suppressHydrationWarning>
      <body className="w-screen h-screen bg-gradient-to-b from-background to-foreground text-foreground">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
