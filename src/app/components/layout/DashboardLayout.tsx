import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useState } from 'react';
import { PlanBanner } from '../dashboard/PlanBanner';

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:ml-[230px] flex-1 flex flex-col min-h-screen w-full">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="p-4 sm:p-6 md:p-7 flex-1">
          <PlanBanner />
          <Outlet />
        </div>
      </main>
    </div>
  );
}