import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Users } from "lucide-react";
import { motion } from "framer-motion";

const tabs = [
  { path: "/", icon: Home, label: "Aujourd'hui" },
  { path: "/history", icon: CalendarDays, label: "Historique" },
  { path: "/community", icon: Users, label: "Communauté" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-[#F9EFE4] rounded-t-3xl shadow-[0_-4px_30px_rgba(0,0,0,0.1)] px-4 pb-6 pt-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="flex flex-col items-center gap-1 relative px-6 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#707AD6] rounded-2xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <tab.icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive ? "text-[#F9EFE4]" : "text-[#B7A08C]"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium relative z-10 transition-colors duration-200 ${
                    isActive ? "text-[#F9EFE4]" : "text-[#B7A08C]"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}