import React, { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { useUser } from "./context/UserContext";
import { BookingPage } from "./components/pages/BookingPage";
import { ClientProfile } from "./components/pages/ClientProfile";
import { SessionNoteEditor } from "./components/pages/SessionNoteEditor";
import { Login } from "./components/pages/Login";
import { Landing } from "./components/pages/Landing";
import { ClientPortal } from "./components/pages/ClientPortal";
import { ClientPortalFull } from "./components/pages/ClientPortalFull";
import { Onboarding } from "./components/pages/Onboarding";
const Checkout = lazy(() => import("./components/pages/Checkout").then(m => ({ default: m.Checkout })));
import { CheckoutSuccess } from "./components/pages/CheckoutSuccess";
import { FAQ } from "./components/pages/FAQ";
import { Contact } from "./components/pages/Contact";
import { Support } from "./components/pages/Support";
import { TrialAdmin } from "./components/pages/TrialAdmin";
import { AITest } from "./components/pages/AITest";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { Overview } from "./components/pages/Overview";
import { Clients } from "./components/pages/Clients";
import { SessionNotes } from "./components/pages/SessionNotes";
import { Billing } from "./components/pages/Billing";
import { CalendarView } from "./components/pages/CalendarView";
import { Messages } from "./components/pages/Messages";
import { CulturalTemplates } from "./components/pages/CulturalTemplates";
import { Settings } from "./components/pages/Settings";
import { Compliance } from "./components/pages/Compliance";
import { ClinicalTools } from "./components/pages/ClinicalTools";
import { SessionPrep } from "./components/pages/SessionPrep";
import { OutcomeMeasures } from "./components/pages/OutcomeMeasures";
import { Waitlist } from "./components/pages/Waitlist";
import { TherapistWellbeing } from "./components/pages/TherapistWellbeing";
import { Resources } from "./components/pages/Resources";
import { ForTherapists } from "./components/pages/ForTherapists";
import { ForChiropractors } from "./components/pages/ForChiropractors";
import { ForPhysiotherapists } from "./components/pages/ForPhysiotherapists";
import { ForMassageTherapists } from "./components/pages/ForMassageTherapists";
import { ForNaturopaths } from "./components/pages/ForNaturopaths";
import { GroupPractice } from "./components/pages/GroupPractice";
import { InsuranceReceipts } from "./components/pages/InsuranceReceipts";
import { CostSavings } from "./components/pages/CostSavings";
import { HEPBuilder } from "./components/pages/HEPBuilder";
import { TreatmentCourses } from "./components/pages/TreatmentCourses";
import { ProfessionIntake } from "./components/pages/ProfessionIntake";
import { Subscribe } from "./components/pages/Subscribe";

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
    element: <Login />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/client-portal",
    element: <ClientPortal />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/client-portal-full",
    element: <ClientPortalFull />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/onboarding",
    element: <Onboarding />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout",
    element: <Suspense fallback={null}><Checkout /></Suspense>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/checkout-success",
    element: <CheckoutSuccess />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/faq",
    element: <FAQ />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/contact",
    element: <Contact />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/support",
    element: <Support />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/trial-admin",
    element: <TrialAdmin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/ai-test",
    element: <AITest />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/book",
    element: <BookingPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/intake",
    element: <ProfessionIntake />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/subscribe",
    element: <Subscribe />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/session-note-editor",
    element: <RequireAuth><SessionNoteEditor /></RequireAuth>,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard/clients/:clientId",
    element: <RequireAuth><ClientProfile /></RequireAuth>,
    errorElement: <ErrorBoundary />,
  },
  // Dashboard with all nested routes
  {
    path: "/dashboard",
    element: <RequireAuth><DashboardLayout /></RequireAuth>,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Overview /> },
      { path: "clients", element: <Clients /> },
      { path: "notes", element: <SessionNotes /> },
      { path: "billing", element: <Billing /> },
      { path: "calendar", element: <CalendarView /> },
      { path: "messages", element: <Messages /> },
      { path: "settings", element: <Settings /> },
      { path: "compliance", element: <Compliance /> },
      { path: "cultural-templates", element: <CulturalTemplates /> },
      { path: "clinical-tools", element: <ClinicalTools /> },
      { path: "session-prep", element: <SessionPrep /> },
      { path: "outcome-measures", element: <OutcomeMeasures /> },
      { path: "waitlist", element: <Waitlist /> },
      { path: "therapist-wellbeing", element: <TherapistWellbeing /> },
      { path: "group-practice", element: <GroupPractice /> },
      { path: "insurance-receipts", element: <InsuranceReceipts /> },
      { path: "treatment-courses", element: <TreatmentCourses /> },
      { path: "hep-builder", element: <HEPBuilder /> },
      { path: "cost-savings", element: <CostSavings /> },
      { path: "resources", element: <Resources /> },
      { path: "faq", element: <FAQ /> },
      { path: "support", element: <Support /> },
    ],
  },
  { path: "/for-therapists", element: <ForTherapists />, errorElement: <ErrorBoundary /> },
  { path: "/for-chiropractors", element: <ForChiropractors />, errorElement: <ErrorBoundary /> },
  { path: "/for-physiotherapists", element: <ForPhysiotherapists />, errorElement: <ErrorBoundary /> },
  { path: "/for-massage-therapists", element: <ForMassageTherapists />, errorElement: <ErrorBoundary /> },
  { path: "/for-naturopaths", element: <ForNaturopaths />, errorElement: <ErrorBoundary /> },
  // Catch-all redirect to landing page
  {
    path: "*",
    element: <Navigate to="/" replace />,
    errorElement: <ErrorBoundary />,
  },
]);

export { router };