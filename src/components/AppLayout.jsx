import React from "react";
import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

export default function AppLayout() {
  return (
    <div
      className="min-h-screen bg-[#707AD6]"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <Outlet />
      <BottomNav />
    </div>
  );
}