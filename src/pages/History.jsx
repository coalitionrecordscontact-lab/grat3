import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format } from "date-fns";
import DayCard from "../components/DayCard";
import MonthCard from "../components/MonthCard";
import PullToRefresh from "../components/PullToRefresh";
import { fetchCurrentUser } from "@/lib/current-user";

function getCurrentMonth() {
  return format(new Date(), "yyyy-MM");
}

export default function History() {
  const [tab, setTab] = useState("days");
  const queryClient = useQueryClient();
  const currentMonth = getCurrentMonth();

  // Single source of truth for current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: fetchCurrentUser,
    staleTime: 0,
    retry: 3,
    retryDelay: 1000,
    refetchOnMount: "always",
  });

  // Merge the saved record directly into the cache instead of refetching.
  // A refetch right after a write can return stale data and wipe the text
  // the user just typed (the "disappearing monthly text" bug).
  const handleMonthUpdated = (saved) => {
    if (!saved) return;
    queryClient.setQueryData(["monthly-history", currentUser?.email], (old) => {
      const arr = Array.isArray(old) ? old : [];
      const idx = arr.findIndex((e) => e.id === saved.id || e.month === saved.month);
      if (idx >= 0) {
        const copy = [...arr];
        copy[idx] = { ...copy[idx], ...saved };
        return copy;
      }
      return [saved, ...arr];
    });
  };

  // Days data
  const { data: rawEntries, isLoading: loadingDays, refetch: refetchDays } = useQuery({
    queryKey: ["gratitude-history", currentUser?.email],
    enabled: !!currentUser?.email,
    queryFn: async () => {
      return base44.entities.GratitudeEntry.filter(
        { created_by: currentUser.email },
        "-date",
        200
      );
    },
    initialData: [],
    refetchOnMount: "always",
  });
  const entries = Array.isArray(rawEntries) ? rawEntries : [];

  // Months data
  const { data: rawMonthEntries, isLoading: loadingMonths, refetch: refetchMonths } = useQuery({
    queryKey: ["monthly-history", currentUser?.email],
    enabled: !!currentUser?.email,
    queryFn: async () => {
      return base44.entities.MonthlyEntry.filter(
        { created_by: currentUser.email },
        "-month",
        100
      );
    },
    initialData: [],
    // No aggressive refetch here: a server refetch right after typing can
    // return stale data and overwrite the optimistic cache (text disappearing).
    staleTime: 60000,
  });
  const monthEntries = Array.isArray(rawMonthEntries) ? rawMonthEntries : [];

  // Current month entry — use the existing one, or a virtual (id-less) entry.
  // MonthCard creates the real record only on first edit, avoiding empty duplicates.
  const currentMonthEntry =
    monthEntries.find((e) => e.month === currentMonth) || { month: currentMonth };

  const pastMonthEntries = monthEntries.filter((e) => e.month !== currentMonth);

  const handleRefresh = async () => {
    if (tab === "days") await refetchDays();
    else await refetchMonths();
  };

  const isLoading = tab === "days" ? loadingDays : loadingMonths;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-[#F9EFE4] text-3xl font-rounded">History</h1>
          {tab === "days" && entries.length > 0 && (
            <p className="text-[#F9EFE4]/60 text-sm mt-2 font-body">
              {entries.length} day{entries.length > 1 ? "s" : ""} recorded
            </p>
          )}
          {tab === "months" && monthEntries.length > 0 && (
            <p className="text-[#F9EFE4]/60 text-sm mt-2 font-body">
              {monthEntries.length} month{monthEntries.length > 1 ? "s" : ""} recorded
            </p>
          )}
        </motion.div>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6">
          {["days", "months"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full font-rounded text-sm transition-all ${
                tab === t
                  ? "bg-[#F8F0E5] text-[#807AC7]"
                  : "bg-[#F9EFE4]/20 text-[#F9EFE4]/70"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
          </div>
        ) : tab === "days" ? (
          entries.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="text-stone-300 text-lg font-body">No entries yet</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <DayCard key={entry.id} entry={entry} index={index} />
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            {currentMonthEntry && (
              <MonthCard
                key={currentMonth}
                entry={currentMonthEntry}
                index={0}
                isCurrent={true}
                onUpdated={handleMonthUpdated}
              />
            )}
            {pastMonthEntries.map((entry, index) => (
              <MonthCard
                key={entry.month}
                entry={entry}
                index={index + 1}
                isCurrent={false}
                onUpdated={handleMonthUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}