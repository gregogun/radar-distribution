import { darkTheme, globalCss } from "@/stitches.config";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Toaster } from "sonner";

const globalStyles = globalCss({
  // "@dark": {
  //   // notice the `media` definition on the stitches.config.ts file
  //   ":root:not(.light)": {
  //     ...Object.keys(darkTheme.colors).reduce((varSet, currentColorKey) => {
  //       //@ts-ignore
  //       const currentColor = darkTheme.colors[currentColorKey];
  //       const currentColorValue =
  //         currentColor.value.substring(0, 1) === "$"
  //           ? `$colors${currentColor.value}`
  //           : currentColor.value;

  //       return {
  //         [currentColor.variable]: currentColorValue,
  //         ...varSet,
  //       };
  //     }, {}),
  //   },
  // },

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

globalStyles();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      disableTransitionOnChange
      attribute="class"
      value={{ light: "light-theme", dark: darkTheme.className }}
      enableSystem
    >
      <Toaster richColors position="bottom-right" />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
