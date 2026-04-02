import { Geist, Geist_Mono, Roboto_Slab } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { QueryClientProvider } from "@/components/provider/queryClientProvider"
import { ThemeProvider } from "@/components/provider/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-serif" })

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontSans.variable, fontMono.variable, "font-serif", robotoSlab.variable)}
    >
      <body>
        <QueryClientProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
