import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import CartDrawer from "@/components/CartDrawer";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import BuildPage from "@/pages/BuildPage";
import RevisionPage from "@/pages/RevisionPage";
import VaultPage from "@/pages/VaultPage";
import AdminPage from "@/pages/AdminPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import WorkspacePage from "@/pages/WorkspacePage";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function SignInPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        appearance={{
          variables: {
            colorPrimary: "hsl(44 54% 54%)",
            colorBackground: "hsl(252 28% 5%)",
            colorInputBackground: "rgba(255,255,255,0.04)",
            colorText: "#e2e8f0",
            colorTextSecondary: "rgba(255,255,255,0.45)",
            colorInputText: "#e2e8f0",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          elements: {
            card: "shadow-2xl border border-white/[0.08]",
            headerTitle: "text-foreground font-bold",
            socialButtonsBlockButton: "border border-white/[0.08] hover:border-white/[0.15]",
            formButtonPrimary: "bg-primary hover:opacity-90",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        appearance={{
          variables: {
            colorPrimary: "hsl(44 54% 54%)",
            colorBackground: "hsl(252 28% 5%)",
            colorInputBackground: "rgba(255,255,255,0.04)",
            colorText: "#e2e8f0",
            colorTextSecondary: "rgba(255,255,255,0.45)",
            colorInputText: "#e2e8f0",
            borderRadius: "0.75rem",
            fontFamily: "inherit",
          },
          elements: {
            card: "shadow-2xl border border-white/[0.08]",
            headerTitle: "text-foreground font-bold",
            socialButtonsBlockButton: "border border-white/[0.08] hover:border-white/[0.15]",
            formButtonPrimary: "bg-primary hover:opacity-90",
            footerActionLink: "text-primary hover:text-primary/80",
          },
        }}
      />
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const uid = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== uid) qc.clear();
      prevRef.current = uid;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/product/:id" component={ProductDetailPage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/build" component={BuildPage} />
          <Route path="/revision-tickets" component={RevisionPage} />
          <Route path="/vault" component={VaultPage} />
          <Route path="/workspace" component={WorkspacePage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      <ChatWidget />
      <CartDrawer />
    </div>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider>
          <LanguageProvider>
            <CartProvider>
              <TooltipProvider>
                <Router />
                <Toaster />
              </TooltipProvider>
            </CartProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
