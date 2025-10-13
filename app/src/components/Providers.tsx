"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Web3Provider } from "@/lib/Web3Context";
import theme from "@/lib/theme";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3Provider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Web3Provider>
  );
}
