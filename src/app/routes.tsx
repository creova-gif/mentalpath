import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { useUser } from "./context/UserContext";
const BookingPage = lazy(() => import("./components/pages/BookingPage").then(m => ({ default: m.BookingPage })));
const ClientProfile = lazy(() => import("./components/pages/ClientProfile").then(m => ({ default: m.ClientProfile })));
const SessionNoteEditor = lazy(() => import("./components/pages/SessionNoteEditor").then(m => ({ default: m.SessionNoteEditor })));
const Login = lazy(() => import("./components/pages/Login").then(m => ({ default: m.Login })));
const ResetPassword = lazy(() => import("./components/pages/ResetPassword").then(m => ({ default: m.ResetPassword })));
import { MfaGate } from "./components/auth/MfaGate";
import { PreviewPage, ClientFacingUnavailable } from "./components/ui/PreviewPage";

const CLIENT_FACING_ENABLED = import.meta.env.DEV;
import { Landing } from "./components/pages/Landing";
const ClientPortal = lazy(() => import("./components/pages/ClientPortal").then(m => ({ default: m.ClientPortal })));
const ClientPortalFull = lazy(() => import("./components/pages/ClientPortalFull").then(m => ({ default: m.ClientPortalFull })));
const Onboarding = lazy(() => import("./components/pages/Onboarding").then(m => ({ default: m.Onboarding })));
const Checkout = lazy(() => import("./components/pages/Checkout").then(m => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() => import("./components/pages/CheckoutSuccess").then(m => ({ default: m.CheckoutSuccess })));
const FAQ = lazy(() => import("./components/pages/FAQ").then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import("./components/pages/Contact").then(m => ({ default: m.Contact })));
const Support = lazy(() => import("./components/pages/Support").then(m => ({ default: m.Support })));
const AITest = lazy(() => import("./components/pages/AITest").then(m => ({ default: m.AITest })));
import { DashboardLayout } from "./components/layout/DashboardLayout";
const Overview = lazy(() => import("./components/pages/Overview").then(m => ({ default: m.Overview })));
const Clients = lazy(() => import("./components/pages/Clients").then(m => ({ default: m.Clients })));
const SessionNotes = lazy(() => import("./components/pages/SessionNotes").then(m => ({ default: m.SessionNotes })));
const Billing = lazy(() => import("./components/pages/Billing").then(m => ({ default: m.Billing })));
const CalendarView = lazy(() => import("./components/pages/CalendarView").then(m => ({ default: m.CalendarView })));
const Messages = lazy(() => import("./components/pages/Messages").then(m => ({ default: m.Messages })));
const CulturalTemplates = lazy(() => import("./components/pages/CulturalTemplates").then(m => ({ default: m.CulturalTemplates })));
const Settings = lazy(() => import("./components/pages/Settings").then(m => ({ default: m.Settings })));
const Compliance = lazy(() => import("./components/pages/Compliance").then(m => ({ default: m.Compliance })));
const ClinicalTools = lazy(() => import("./components/pages/ClinicalTools").then(m => ({ default: m.ClinicalTools })));
const SessionPrep = lazy(() => import("./components/pages/SessionPrep").then(m => ({ default: m.SessionPrep })));
const OutcomeMeasures = lazy(() => import("./components/pages/OutcomeMeasures").then(m => ({ default: m.OutcomeMeasures })));
const Waitlist = lazy(() => import("./components/pages/Waitlist").then(m => ({ default: m.Waitlist })));
const TherapistWellbeing = lazy(() => import("./components/pages/TherapistWellbeing").then(m => ({ default: m.TherapistWellbeing })));
const Resources = lazy(() => import("./components/pages/Resources").then(m => ({ default: m.Resources })));
const ForTherapists = lazy(() => import("./components/pages/ForTherapists").then(m => ({ default: m.ForTherapists })));
const ForChiropractors = lazy(() => import("./components/pages/ForChiropractors").then(m => ({ default: m.ForChiropractors })));
const ForPhysiotherapists = lazy(() => import("./components/pages/ForPhysiotherapists").then(m => ({ default: m.ForPhysiotherapists })));
const ForMassageTherapists = lazy(() => import("./components/pages/ForMassageTherapists").then(m => ({ default: m.ForMassageTherapists })));
const ForNaturopaths = lazy(() => import("./components/pages/ForNaturopaths").then(m => ({ default: m.ForNaturopaths })));
const GroupPractice = lazy(() => import("./components/pages/GroupPractice").then(m => ({ default: m.GroupPractice })));
const InsuranceReceipts = lazy(() => import("./components/pages/InsuranceReceipts").then(m => ({ default: m.InsuranceReceipts })));
const CostSavings = lazy(() => import("./components/pages/CostSavings").then(m => ({ default: m.CostSavings })));
const HEPBuilder = lazy(() => import("./components/pages/HEPBuilder").then(m => ({ default: m.HEPBuilder })));
const TreatmentCourses = lazy(() => import("./components/pages/TreatmentCourses").then(m => ({ default: m.TreatmentCourses })));
const ProfessionIntake = lazy(() => import("./components/pages/ProfessionIntake").then(m => ({ default: m.ProfessionIntake })));
const Subscribe = lazy(() => import("./components/pages/Subscribe").then(m => ({ default: m.Subscribe })));

// Auth guard — redirects unauthenticated users to /login, then requires an
// MFA-verified session (the database enforces the same rule via RLS).
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  if (isLoading) return <PageFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <MfaGate>{children}</MfaGate>;
}

function PageFallback() {
  return (
    <div role="status" aria-live="polite" className="min-h-screen flex items-center justify-center text-sm text-[var(--ink-muted)]">
      Loading…
    </div>
  );
}

// Simple error boundary fallback
function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-serif text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <a href="/" className="text-[#4a7c6f] hover:underline">Return to Home</a>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <Suspense fallback={<PageFallback />}><Login /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/reset-password",
    element: <Suspense fallback={<PageFallback />}><ResetPassword /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  { path: "/signup", element: <Navigate to="/onboarding" replace /> },
  {
    path: "/client-portal",
    element: CLIENT_FACING_ENABLED ? <Suspense fallback={<PageFallback />}><ClientPortal /></Suspense> : <ClientFacingUnavailable />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/client-portal-full",
    element: CLIENT_FACING_ENABLED ? <Suspense fallback={<PageFallback />}><ClientPortalFull /></Suspense> : <ClientFacingUnavailable />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/onboarding",
    element: <Suspense fallback={<PageFallback />}><Onboarding /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout",
    element: <Suspense fallback={<PageFallback />}><Checkout /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout-success",
    element: <Suspense fallback={<PageFallback />}><CheckoutSuccess /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/faq",
    element: <Suspense fallback={<PageFallback />}><FAQ /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/contact",
    element: <Suspense fallback={<PageFallback />}><Contact /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/support",
    element: <Suspense fallback={<PageFallback />}><Support /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  // Debug AI playground — local development builds only (never in production).
  ...(import.meta.env.DEV ? [{
    path: "/ai-test",
    element: <Suspense fallback={<PageFallback />}><AITest /></Suspense>,
    errorElement: <ErrorBoundary />,
  }] : []),
  {
    path: "/book",
    element: CLIENT_FACING_ENABLED ? <Suspense fallback={<PageFallback />}><BookingPage /></Suspense> : <ClientFacingUnavailable />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/intake",
    element: CLIENT_FACING_ENABLED ? <Suspense fallback={<PageFallback />}><ProfessionIntake /></Suspense> : <ClientFacingUnavailable />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/subscribe",
    element: <Suspense fallback={<PageFallback />}><Subscribe /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/session-note-editor",
    element: <RequireAuth><Suspense fallback={<PageFallback />}><SessionNoteEditor /></Suspense></RequireAuth>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard/clients/:clientId",
    element: <RequireAuth><Suspense fallback={<PageFallback />}><ClientProfile /></Suspense></RequireAuth>,
    errorElement: <ErrorBoundary />,
  },
  // Dashboard with all nested routes
  {
    path: "/dashboard",
    element: <RequireAuth><DashboardLayout /></RequireAuth>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><Overview /></Suspense> },
      { path: "clients", element: <Suspense fallback={<PageFallback />}><Clients /></Suspense> },
      { path: "notes", element: <Suspense fallback={<PageFallback />}><SessionNotes /></Suspense> },
      { path: "billing", element: <Suspense fallback={<PageFallback />}><Billing /></Suspense> },
      { path: "calendar", element: <Suspense fallback={<PageFallback />}><CalendarView /></Suspense> },
      { path: "messages", element: <PreviewPage><Suspense fallback={<PageFallback />}><Messages /></Suspense></PreviewPage> },
      { path: "settings", element: <Suspense fallback={<PageFallback />}><Settings /></Suspense> },
      { path: "compliance", element: <Suspense fallback={<PageFallback />}><Compliance /></Suspense> },
      { path: "cultural-templates", element: <Suspense fallback={<PageFallback />}><CulturalTemplates /></Suspense> },
      { path: "clinical-tools", element: <PreviewPage><Suspense fallback={<PageFallback />}><ClinicalTools /></Suspense></PreviewPage> },
      { path: "session-prep", element: <PreviewPage><Suspense fallback={<PageFallback />}><SessionPrep /></Suspense></PreviewPage> },
      { path: "outcome-measures", element: <PreviewPage><Suspense fallback={<PageFallback />}><OutcomeMeasures /></Suspense></PreviewPage> },
      { path: "waitlist", element: <Suspense fallback={<PageFallback />}><Waitlist /></Suspense> },
      { path: "therapist-wellbeing", element: <Suspense fallback={<PageFallback />}><TherapistWellbeing /></Suspense> },
      { path: "group-practice", element: <PreviewPage><Suspense fallback={<PageFallback />}><GroupPractice /></Suspense></PreviewPage> },
      { path: "insurance-receipts", element: <PreviewPage><Suspense fallback={<PageFallback />}><InsuranceReceipts /></Suspense></PreviewPage> },
      { path: "treatment-courses", element: <PreviewPage><Suspense fallback={<PageFallback />}><TreatmentCourses /></Suspense></PreviewPage> },
      { path: "hep-builder", element: <PreviewPage><Suspense fallback={<PageFallback />}><HEPBuilder /></Suspense></PreviewPage> },
      { path: "cost-savings", element: <Suspense fallback={<PageFallback />}><CostSavings /></Suspense> },
      { path: "resources", element: <Suspense fallback={<PageFallback />}><Resources /></Suspense> },
      { path: "faq", element: <Suspense fallback={<PageFallback />}><FAQ /></Suspense> },
      { path: "support", element: <Suspense fallback={<PageFallback />}><Support /></Suspense> },
    ],
  },
  { path: "/for-therapists", element: <Suspense fallback={<PageFallback />}><ForTherapists /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-chiropractors", element: <Suspense fallback={<PageFallback />}><ForChiropractors /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-physiotherapists", element: <Suspense fallback={<PageFallback />}><ForPhysiotherapists /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-massage-therapists", element: <Suspense fallback={<PageFallback />}><ForMassageTherapists /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-naturopaths", element: <Suspense fallback={<PageFallback />}><ForNaturopaths /></Suspense>, errorElement: <ErrorBoundary /> },
  // Catch-all redirect to landing page
  {
    path: "*",
    element: <Navigate to="/" replace />,
    errorElement: <ErrorBoundary />,
  },
]);

export { router };