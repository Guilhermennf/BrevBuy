import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/next-auth/session-provider";
import { QueryProvider } from "@/components/react-query/query-provider";
import { GlobalToastProvider } from "@/components/toast/global-toast-provider";
import packageIcon from "@/assets/images/package.png";

// Use system fonts without external dependencies
const interFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

export const metadata: Metadata = {
  title: "BrevBuy",
  icons: {
    icon: packageIcon.src,
  },
  description: "Sistema para controle de produtos comprados e vendidos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{ fontFamily: interFont }}>
        <SessionProvider>
          <QueryProvider>
            <GlobalToastProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                {children}
                <Toaster />
              </ThemeProvider>
            </GlobalToastProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
