import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import { OfflineBanner } from "@/components/OfflineBanner";

// Eager Load Main Pages for Performance
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyMatches from "./pages/MyMatches";
import RequestMatch from "./pages/RequestMatch";
import PublicProfiles from "./pages/PublicProfiles";
import Dashboard from "./pages/Dashboard";

// Lazy Load Less Critical Pages
const About = lazy(() => import("./pages/About"));
const SuccessStories = lazy(() => import("./pages/SuccessStories"));
const Contact = lazy(() => import("./pages/Contact"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Admin = lazy(() => import("./pages/Admin"));
const EditProfile = lazy(() => import("./pages/EditProfile"));
const ViewProfile = lazy(() => import("./pages/ViewProfile"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const PaymentInfo = lazy(() => import("./pages/PaymentInfo"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-muted-foreground animate-pulse text-sm">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OfflineBanner />
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/payment-info" element={<PaymentInfo />} />
                <Route path="/my-matches" element={<MyMatches />} />
                <Route path="/request-match" element={<RequestMatch />} />
                <Route path="/all-profiles" element={<PublicProfiles />} />
                <Route path="/success-stories" element={<SuccessStories />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/dashboard" element={<Navigate to="/my-matches" replace />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile/edit/:id" element={<EditProfile />} />
                <Route path="/profile/view/:id" element={<ViewProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
