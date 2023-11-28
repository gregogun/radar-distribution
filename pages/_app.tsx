import { ConnectProvider } from "@/hooks/useConnect";
import { darkTheme, globalCss } from "@/stitches.config";
import "@/styles/globals.css";
import { ArweaveWebWallet } from "arweave-wallet-connector";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { IrysProvider } from "@/hooks/useIrys";

const globalStyles = globalCss({
  "*, *::before, *::after": {
    boxSizing: "border-box",
  },
  "*": {
    "*:focus:not(.focus-visible)": {
      outline: "none",
    },
  },
  "html, body, #root, #__next": {
    minHeight: "100vh",
    fontFamily: "$body",
    margin: 0,
    backgroundColor: "$slate1",
    color: "$slate11",
  },
  "& a": {
    "&:focus-visible": {
      boxShadow: "0 0 0 2px $colors$blue8",
    },
  },
});

const queryClient = new QueryClient();

globalStyles();

const webWallet = new ArweaveWebWallet({
  name: "Radar",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        disableTransitionOnChange
        attribute="class"
        value={{ light: "light-theme", dark: darkTheme.className }}
        enableSystem
      >
        <IrysProvider>
          <ConnectProvider
            webWallet={webWallet}
            includeProfile
            detectWalletSwitch
          >
            <Toaster richColors position="bottom-right" />
            <Component {...pageProps} />
          </ConnectProvider>
        </IrysProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
