import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/Navbar/Navbar";
import { Providers } from "@/components/provider/Providers";
import "@rainbow-me/rainbowkit/styles.css";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Exchange | TrunkSwap",
  description: "trunkswap.vercel.app/",
};

const NEXT_PUBLIC_MEASUREMENT_ID = process.env.NEXT_PUBLIC_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics gaId={NEXT_PUBLIC_MEASUREMENT_ID!} />

      <body
        className={`${geistSans.variable} ${geistMono.variable} w-full flex items-center justify-center relative h-full  antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="w-full  h-full relative">
            <Providers>
              {/* <div className="absolute top-0 bottom-0 left-0 bg-[#0d53bb] light:bg-[#0d53bb]/20 rounded-none blur-[300px] w-[22rem] h-[32rem] -z-10"></div> */}
              <Navbar />
              {children}

              {/* <div className="absolute right-0 top-0  bg-[#0d0dbb] light:bg-[#0d0dbb]/20 rounded-none blur-[300px] w-[22rem] h-[32rem] -z-10"></div> */}
              <NextTopLoader
                color="#2299DD"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={100}
                shadow="0 0 10px #2299DD,0 0 5px #2299DD"
                template='<div class="bar" role="bar"><div class="peg"></div></div> 
                <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
                zIndex={1600}
                showAtBottom={false}
              />
              <Toaster />
            </Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
