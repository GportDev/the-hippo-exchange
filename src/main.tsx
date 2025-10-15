import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import { Toaster } from "sonner";
import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import reportWebVitals from "./reportWebVitals";

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();

const router = createRouter({
  routeTree,
  context: { ...TanStackQueryProviderContext },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing Clerk Publishable Key");

const rootElement = document.getElementById("app");
if (!rootElement) throw new Error("Missing #app element");

const app = (
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <Toaster />
        <RouterProvider router={router} />
      </TanStackQueryProvider.Provider>
    </ClerkProvider>
  </StrictMode>
);

if (rootElement.innerHTML) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}

reportWebVitals();