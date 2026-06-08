import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import PullToRefresh from "../components/PullToRefresh";

export default function Retrospective() {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
  const monthLabel = format(now, "MMMM yyyy");

  const { data: entries, isLoading, refetch } = useQuery({
    queryKey: ["retrospective", monthStart],
    queryFn: async () => {
      const user = await base44.auth.me();
      const all = await base44.entities.GratitudeEntry.filter(
        { created_by_id: user.id },
        "-date",
        100
      );
      return all.filter((e) => e.date >= monthStart && e.date <= monthEnd && e.is_complete);
    },
    initialData: [],
  });

  // Collect all moments from completed entries
  const moments = entries.flatMap((e) =>
    [e.event_1, e.event_2, e.event_3]
      .filter(Boolean)
      .map((text) => ({ text, date: e.date }))
  );

  return (
    <PullToRefresh onRefresh={refetch}>
      <div className="min-h-screen bg-[#F9EFE4] pb-28 px-5 pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="text-[#B7A08C] text-sm font-body uppercase tracking-widest mb-1">
            Retrospective
          </p>
          <h1 className="text-[#1A215B] text-3xl font-heading capitalize">
            {monthLabel}
          </h1>
          <p className="text-[#B7A08C] text-sm font-body mt-1">
            {moments.length} positive moment{moments.length !== 1 ? "s" : ""} this month
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#B7A08C]/30 border-t-[#B7A08C] rounded-full animate-spin" />
          </div>
        ) : moments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Sparkles className="w-10 h-10 text-[#B7A08C]/30 mb-4" />
            <p className="text-[#B7A08C] font-body text-base">
              No completed days yet this month.
            </p>
            <p className="text-[#B7A08C]/50 font-body text-sm mt-1">
              Start filling your moments every day!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {moments.map((moment, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="bg-white rounded-3xl px-6 py-5 shadow-sm flex items-start gap-4"
              >
                <div className="bg-[#707AD6] rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4 text-[#F9EFE4]" />
                </div>
                <div>
                  <p className="text-[#1A215B] font-body text-base leading-relaxed">
                    {moment.text}
                  </p>
                  <p className="text-[#B7A08C]/60 text-xs font-body mt-1">
                    {format(parseISO(moment.date), "EEEE, MMMM d")}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}