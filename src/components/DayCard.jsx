import React from "react";
import { motion } from "framer-motion";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Star } from "lucide-react";

function formatDayLabel(dateStr) {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEEE, MMMM d");
}

export default function DayCard({ entry, index }) {
  const events = [entry.event_1, entry.event_2, entry.event_3].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-[#F9EFE4] rounded-3xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#B7A08C] font-heading text-lg font-semibold capitalize">
          {formatDayLabel(entry.date)}
        </h3>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < events.length
                  ? "text-[#707AD6] fill-[#707AD6]"
                  : "text-[#B7A08C]/20"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {events.map((event, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-[#707AD6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-[#707AD6] text-xs font-semibold">
                {i + 1}
              </span>
            </div>
            <p className="text-[#B7A08C] text-sm font-body leading-relaxed">
              {event}
            </p>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-[#B7A08C]/40 text-sm italic">
            No moments recorded
          </p>
        )}
      </div>
    </motion.div>
  );
}