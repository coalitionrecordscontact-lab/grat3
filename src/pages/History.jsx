import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DayCard from "../components/DayCard";
import MonthCard from "../components/MonthCard";
import PullToRefresh from "../components/PullToRefresh";

function getCurrentMonth() {
  return format(new Date(), "yyyy-MM");
}

export default function History() {
  const [tab, setTab] = useState("days");
  const queryClient = useQueryClient();

  // Days data
  const { data: entries, isLoading: loadingDays, refetch: refetchDays } = useQuery({
    queryKey: ["gratitude-history"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.GratitudeEntry.filter({ created_by: user.email }, "-date", 200);
    },
    initialData: []
  });

  // Months data
  const { data: monthEntries, isLoading: loadingMonths, refetch: refetchMonths } = useQuery({
    queryKey: ["monthly-history"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.MonthlyEntry.filter({ created_by: user.email }, "-month", 100);
    },
    initialData: []
  });

  const currentMonth = getCurrentMonth();

  // Ensure current month always appears at the top
  const currentMonthEntry = monthEntries.find((e) => e.month === currentMonth) || { month: currentMonth };
  const pastMonthEntries = monthEntries.filter((e) => e.month !== currentMonth);

  const handleRefresh = async () => {
    if (tab === "days") await refetchDays();else
    await refetchMonths();
  };

  const isLoading = tab === "days" ? loadingDays : loadingMonths;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6">
          
          <h1 className="text-[#F9EFE4] text-3xl font-rounded">History</h1>
          {tab === "days" && entries.length > 0 &&
          <p className="text-[#F9EFE4]/60 text-sm mt-2 font-body">
              {entries.length} day{entries.length > 1 ? "s" : ""} recorded
            </p>
          }
          {tab === "months" && monthEntries.length > 0 &&
          <p className="text-[#F9EFE4]/60 text-sm mt-2 font-body">
              {monthEntries.length} month{monthEntries.length > 1 ? "s" : ""} recorded
            </p>
          }
        </motion.div>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          {["days", "months"].map((t) =>
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full font-rounded text-sm transition-all ${
            tab === t ?
            "bg-[#F8F0E5] text-[#807AC7]" :
            "bg-[#F9EFE4]/20 text-[#F9EFE4]/70"}`
            }>
            
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          )}
        </div>

        {isLoading ?
        <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
          </div> :
        tab === "days" ?
        entries.length === 0 ?
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-stone-300 text-lg font-body">No entries yet</p>
            </motion.div> :

        <div className="space-y-4">
              {entries.map((entry, index) =>
          <DayCard key={entry.id} entry={entry} index={index} />
          )}
            </div> :


        <div className="space-y-4">
            <MonthCard
            key={currentMonth}
            entry={currentMonthEntry}
            index={0}
            isCurrent={true}
            onUpdated={() => queryClient.invalidateQueries({ queryKey: ["monthly-history"] })} />
          
            {pastMonthEntries.map((entry, index) =>
          <MonthCard
            key={entry.id}
            entry={entry}
            index={index + 1}
            isCurrent={false}
            onUpdated={() => queryClient.invalidateQueries({ queryKey: ["monthly-history"] })} />

          )}
          </div>
        }
      </div>
    </PullToRefresh>);

}