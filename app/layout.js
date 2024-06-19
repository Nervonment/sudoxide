import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import SettingsProvider from "@/components/SettingsProvider";

const inter = Inter({ subsets: ["latin"] });

const harmonyOSSans = localFont({
  src: './fonts/HarmonyOS_Sans_SC_Regular.ttf',
  display: 'swap'
});

export const metadata = {
  title: "Sudoxide",
  description: "",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className={cn(inter.className, harmonyOSSans)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
