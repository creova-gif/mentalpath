import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { useUser } from "./context/UserContext";
const BookingPage = lazy(() => import("./components/pages/BookingPage").then(m => ({ default: m.BookingPage })));
const ClientProfile = lazy(() => import("./components/pages/ClientProfile").then(m => ({ default: m.ClientProfile })));
const SessionNoteEditor = lazy(() => import("./components/pages/SessionNoteEditor").then(m => ({ default: m.SessionNoteEditor })));
const Login = lazy(() => import("./components/pages/Login").then(m => ({ default: m.Login })));
import { Landing } from "./components/pages/Landing";
const ClientPortal = lazy(() => import("./components/pages/ClientPortal").then(m => ({ default: m.ClientPortal })));
const ClientPortalFull = lazy(() => import("./components/pages/ClientPortalFull").then(m => ({ default: m.ClientPortalFull })));
const Onboarding = lazy(() => import("./components/pages/Onboarding").then(m => ({ default: m.Onboarding })));
const Checkout = lazy(() => import("./components/pages/Checkout").then(m => ({ default: m.Checkout })));
const CheckoutSuccess = lazy(() => import("./components/pages/CheckoutSuccess").then(m => ({ default: m.CheckoutSuccess })));
const FAQ = lazy(() => import("./components/pages/FAQ").then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import("./components/pages/Contact").then(m => ({ default: m.Contact })));
const Support = lazy(() => import("./components/pages/Support").then(m => ({ default: m.Support })));
const TrialAdmin = lazy(() => import("./components/pages/TrialAdmin").then(m => ({ default: m.TrialAdmin })));
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

// Auth guard — redirects unauthenticated users to /login
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
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
    element: <Suspense fallback={null}><Login /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/client-portal",
    element: <Suspense fallback={null}><ClientPortal /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/client-portal-full",
    element: <Suspense fallback={null}><ClientPortalFull /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/onboarding",
    element: <Suspense fallback={null}><Onboarding /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout",
    element: <Suspense fallback={null}><Checkout /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout-success",
    element: <Suspense fallback={null}><CheckoutSuccess /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/faq",
    element: <Suspense fallback={null}><FAQ /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/contact",
    element: <Suspense fallback={null}><Contact /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/support",
    element: <Suspense fallback={null}><Support /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  // H-02: Debug admin panel — only accessible in local development builds.
  // import.meta.env.DEV is false in production Vite builds, so this route
  // and its element are tree-shaken out entirely.
  ...(import.meta.env.DEV ? [{
    path: "/trial-admin",
    element: <Suspense fallback={null}><TrialAdmin /></Suspense>,
    errorElement: <ErrorBoundary />,
  }] : []),
  {
    path: "/ai-test",
    element: <Suspense fallback={null}><AITest /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/book",
    element: <Suspense fallback={null}><BookingPage /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/intake",
    element: <Suspense fallback={null}><ProfessionIntake /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/subscribe",
    element: <Suspense fallback={null}><Subscribe /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/session-note-editor",
    element: <RequireAuth><Suspense fallback={null}><SessionNoteEditor /></Suspense></RequireAuth>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard/clients/:clientId",
    element: <RequireAuth><Suspense fallback={null}><ClientProfile /></Suspense></RequireAuth>,
    errorElement: <ErrorBoundary />,
  },
  // Dashboard with all nested routes
  {
    path: "/dashboard",
    element: <RequireAuth><DashboardLayout /></RequireAuth>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Suspense fallback={null}><Overview /></Suspense> },
      { path: "clients", element: <Suspense fallback={null}><Clients /></Suspense> },
      { path: "notes", element: <Suspense fallback={null}><SessionNotes /></Suspense> },
      { path: "billing", element: <Suspense fallback={null}><Billing /></Suspense> },
      { path: "calendar", element: <Suspense fallback={null}><CalendarView /></Suspense> },
      { path: "messages", element: <Suspense fallback={null}><Messages /></Suspense> },
      { path: "settings", element: <Suspense fallback={null}><Settings /></Suspense> },
      { path: "compliance", element: <Suspense fallback={null}><Compliance /></Suspense> },
      { path: "cultural-templates", element: <Suspense fallback={null}><CulturalTemplates /></Suspense> },
      { path: "clinical-tools", element: <Suspense fallback={null}><ClinicalTools /></Suspense> },
      { path: "session-prep", element: <Suspense fallback={null}><SessionPrep /></Suspense> },
      { path: "outcome-measures", element: <Suspense fallback={null}><OutcomeMeasures /></Suspense> },
      { path: "waitlist", element: <Suspense fallback={null}><Waitlist /></Suspense> },
      { path: "therapist-wellbeing", element: <Suspense fallback={null}><TherapistWellbeing /></Suspense> },
      { path: "group-practice", element: <Suspense fallback={null}><GroupPractice /></Suspense> },
      { path: "insurance-receipts", element: <Suspense fallback={null}><InsuranceReceipts /></Suspense> },
      { path: "treatment-courses", element: <Suspense fallback={null}><TreatmentCourses /></Suspense> },
      { path: "hep-builder", element: <Suspense fallback={null}><HEPBuilder /></Suspense> },
      { path: "cost-savings", element: <Suspense fallback={null}><CostSavings /></Suspense> },
      { path: "resources", element: <Suspense fallback={null}><Resources /></Suspense> },
      { path: "faq", element: <Suspense fallback={null}><FAQ /></Suspense> },
      { path: "support", element: <Suspense fallback={null}><Support /></Suspense> },
    ],
  },
  { path: "/for-therapists", element: <Suspense fallback={null}><ForTherapists /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-chiropractors", element: <Suspense fallback={null}><ForChiropractors /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-physiotherapists", element: <Suspense fallback={null}><ForPhysiotherapists /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-massage-therapists", element: <Suspense fallback={null}><ForMassageTherapists /></Suspense>, errorElement: <ErrorBoundary /> },
  { path: "/for-naturopaths", element: <Suspense fallback={null}><ForNaturopaths /></Suspense>, errorElement: <ErrorBoundary /> },
  // Catch-all redirect to landing page
  {
    path: "*",
    element: <Navigate to="/" replace />,
    errorElement: <ErrorBoundary />,
  },
]);

export { router };