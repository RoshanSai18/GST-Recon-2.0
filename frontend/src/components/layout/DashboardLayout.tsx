import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-[240px] transition-all duration-300 min-h-screen">
        <div className="p-6 md:p-8 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
