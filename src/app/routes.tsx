import { trackPageview } from "./lib/telemetry";
import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { useUser } from "./context/UserContext";
const ClientProfile = lazy(() => import("./components/pages/ClientProfile").then(m => ({ default: m.ClientProfile })));
const SessionNoteEditor = lazy(() => import("./components/pages/SessionNoteEditor").then(m => ({ default: m.SessionNoteEditor })));
const Login = lazy(() => import("./components/pages/Login").then(m => ({ default: m.Login })));
const Privacy = lazy(() => import("./components/pages/Privacy").then(m => ({ default: m.Privacy })));
const ResetPassword = lazy(() => import("./components/pages/ResetPassword").then(m => ({ default: m.ResetPassword })));
import { MfaGate } from "./components/auth/MfaGate";
import { PreviewPage, ClientFacingUnavailable } from "./components/ui/PreviewPage";

const CLIENT_FACING_ENABLED = import.meta.env.DEV;
// Prototype screens with no backend (messaging, clinical tools, treatment
// courses, HEP builder) exist only in development builds.
export const PROTOTYPES_ENABLED = import.meta.env.DEV;

// Client-facing prototypes (portal, booking, intake) have no backend yet; in
// production builds they resolve to a "not available" page and their code is
// not bundled (the dead branch and its dynamic import are removed).
const BookingPage = CLIENT_FACING_ENABLED
  ? lazy(() => import("./components/pages/BookingPage").then(m => ({ default: m.BookingPage }))) : ClientFacingUnavailable;
const ClientPortal = CLIENT_FACING_ENABLED
  ? lazy(() => import("./components/pages/ClientPortal").then(m => ({ default: m.ClientPortal }))) : ClientFacingUnavailable;
const ClientPortalFull = CLIENT_FACING_ENABLED
  ? lazy(() => import("./components/pages/ClientPortalFull").then(m => ({ default: m.ClientPortalFull }))) : ClientFacingUnavailable;
const ProfessionIntake = CLIENT_FACING_ENABLED
  ? lazy(() => import("./components/pages/ProfessionIntake").then(m => ({ default: m.ProfessionIntake }))) : ClientFacingUnavailable;
const Landing = lazy(() => import("./components/pages/Landing").then(m => ({ default: m.Landing })));
const Onboarding = lazy(() => import("./components/pages/Onboarding").then(m => ({ default: m.Onboarding })));
const Checkout = lazy(() => import("./components/pages/Checkout").then(m => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() => import("./components/pages/CheckoutSuccess").then(m => ({ default: m.CheckoutSuccess })));
const FAQ = lazy(() => import("./components/pages/FAQ").then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import("./components/pages/Contact").then(m => ({ default: m.Contact })));
const Support = lazy(() => import("./components/pages/Support").then(m => ({ default: m.Support })));
const AITest = lazy(() => import("./components/pages/AITest").then(m => ({ default: m.AITest })));
const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout").then(m => ({ default: m.DashboardLayout })));
const Overview = lazy(() => import("./components/pages/Overview").then(m => ({ default: m.Overview })));
const Clients = lazy(() => import("./components/pages/Clients").then(m => ({ default: m.Clients })));
const SessionNotes = lazy(() => import("./components/pages/SessionNotes").then(m => ({ default: m.SessionNotes })));
const Billing = lazy(() => import("./components/pages/Billing").then(m => ({ default: m.Billing })));
const CalendarView = lazy(() => import("./components/pages/CalendarView").then(m => ({ default: m.CalendarView })));
const CulturalTemplates = lazy(() => import("./components/pages/CulturalTemplates").then(m => ({ default: m.CulturalTemplates })));
const Settings = lazy(() => import("./components/pages/Settings").then(m => ({ default: m.Settings })));
const Compliance = lazy(() => import("./components/pages/Compliance").then(m => ({ default: m.Compliance })));
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
const Subscribe = lazy(() => import("./components/pages/Subscribe").then(m => ({ default: m.Subscribe })));

// Dev-only prototype routes. The whole function is dropped from production
// builds (PROTOTYPES_ENABLED is a compile-time constant), so no chunk ships.
function prototypeRoutes() {
  if (!PROTOTYPES_ENABLED) return [];
  const Messages = lazy(() => import("./components/pages/Messages").then(m => ({ default: m.Messages })));
  const ClinicalTools = lazy(() => import("./components/pages/ClinicalTools").then(m => ({ default: m.ClinicalTools })));
  const TreatmentCourses = lazy(() => import("./components/pages/TreatmentCourses").then(m => ({ default: m.TreatmentCourses })));
  const HEPBuilder = lazy(() => import("./components/pages/HEPBuilder").then(m => ({ default: m.HEPBuilder })));
  return [
    { path: "messages", element: <PreviewPage><Suspense fallback={<PageFallback />}><Messages /></Suspense></PreviewPage> },
    { path: "clinical-tools", element: <PreviewPage><Suspense fallback={<PageFallback />}><ClinicalTools /></Suspense></PreviewPage> },
    { path: "treatment-courses", element: <PreviewPage><Suspense fallback={<PageFallback />}><TreatmentCourses /></Suspense></PreviewPage> },
    { path: "hep-builder", element: <PreviewPage><Suspense fallback={<PageFallback />}><HEPBuilder /></Suspense></PreviewPage> },
  ];
}

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
    element: <Suspense fallback={<PageFallback />}><Landing /></Suspense>,
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
  { path: "/privacy", element: <Suspense fallback={<PageFallback />}><Privacy /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/terms", element: <Navigate to="/contact" replace /> },
  {
    path: "/client-portal",
    element: <Suspense fallback={<PageFallback />}><ClientPortal /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/client-portal-full",
    element: <Suspense fallback={<PageFallback />}><ClientPortalFull /></Suspense>,
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
    element: <Suspense fallback={<PageFallback />}><BookingPage /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/intake",
    element: <Suspense fallback={<PageFallback />}><ProfessionIntake /></Suspense>,
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
    element: <RequireAuth><Suspense fallback={<PageFallback />}><DashboardLayout /></Suspense></RequireAuth>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={<PageFallback />}><Overview /></Suspense> },
      { path: "clients", element: <Suspense fallback={<PageFallback />}><Clients /></Suspense> },
      { path: "notes", element: <Suspense fallback={<PageFallback />}><SessionNotes /></Suspense> },
      { path: "billing", element: <Suspense fallback={<PageFallback />}><Billing /></Suspense> },
      { path: "calendar", element: <Suspense fallback={<PageFallback />}><CalendarView /></Suspense> },
      { path: "settings", element: <Suspense fallback={<PageFallback />}><Settings /></Suspense> },
      { path: "compliance", element: <Suspense fallback={<PageFallback />}><Compliance /></Suspense> },
      { path: "cultural-templates", element: <Suspense fallback={<PageFallback />}><CulturalTemplates /></Suspense> },
      { path: "session-prep", element: <Suspense fallback={<PageFallback />}><SessionPrep /></Suspense> },
      { path: "outcome-measures", element: <Suspense fallback={<PageFallback />}><OutcomeMeasures /></Suspense> },
      { path: "waitlist", element: <Suspense fallback={<PageFallback />}><Waitlist /></Suspense> },
      { path: "therapist-wellbeing", element: <Suspense fallback={<PageFallback />}><TherapistWellbeing /></Suspense> },
      { path: "group-practice", element: <Suspense fallback={<PageFallback />}><GroupPractice /></Suspense> },
      { path: "insurance-receipts", element: <Suspense fallback={<PageFallback />}><InsuranceReceipts /></Suspense> },
      { path: "cost-savings", element: <Suspense fallback={<PageFallback />}><CostSavings /></Suspense> },
      { path: "resources", element: <Suspense fallback={<PageFallback />}><Resources /></Suspense> },
      { path: "faq", element: <Suspense fallback={<PageFallback />}><FAQ /></Suspense> },
      { path: "support", element: <Suspense fallback={<PageFallback />}><Support /></Suspense> },
      ...prototypeRoutes(),
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

// Route-template pageviews only (IDs and query strings are scrubbed).
trackPageview();
router.subscribe(() => trackPageview());

export { router };