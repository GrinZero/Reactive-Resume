import { TooltipProvider } from "@reactive-resume/ui";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Outlet } from "react-router-dom";

import { helmetContext } from "../constants/helmet";
import { initDB } from "../db";
import { queryClient } from "../libs/query-client";
import { AuthRefreshProvider } from "./auth-refresh";
import { DialogProvider } from "./dialog";
import { LocaleProvider } from "./locale";
import { ThemeProvider } from "./theme";
import { Toaster } from "./toaster";

export const Providers = () => {
  useEffect(() => {
    initDB();
  }, []);
  return (
    <LocaleProvider>
      <HelmetProvider context={helmetContext}>
        <QueryClientProvider client={queryClient}>
          <AuthRefreshProvider>
            <ThemeProvider>
              <TooltipProvider>
                <DialogProvider>
                  <Outlet />

                  <Toaster />
                </DialogProvider>
              </TooltipProvider>
            </ThemeProvider>
          </AuthRefreshProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </LocaleProvider>
  );
};
