import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";

function formatMonthLabel(monthStr) {
  return format(parseISO(monthStr + "-01"), "MMMM yyyy");
}

export default function MonthCard({ entry, index, isCurrent, onUpdated }) {
  const [editing, setEditing] = useState(null); // field index being edited (0,1,2)
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const events = [entry.event_1, entry.event_2, entry.event_3];

  const handleEdit = (i) => {
    if (!isCurrent) return;
    setEditing(i);
    setDraft(events[i] || "");
  };

  const inputRef = React.useRef(null);

  // Dismiss keyboard on unmount to prevent iOS RTIInputSystemClient crash
  React.useEffect(() => {
    return () => {
      if (inputRef.current) inputRef.current.blur();
    };
  }, []);

  const handleSave = async (i) => {
    if (inputRef.current) inputRef.current.blur();
    if (!draft.trim()) { setEditing(null); return; }
    setSaving(true);
    const field = `event_${i + 1}`;
    if (entry.id) {
      await base44.entities.MonthlyEntry.update(entry.id, { [field]: draft.trim() });
    } else {
      await base44.entities.MonthlyEntry.create({ month: entry.month, [field]: draft.trim() });
    }
    setSaving(false);
    setEditing(null);
    onUpdated();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-[#F9EFE4] rounded-3xl p-6 shadow-md"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#B7A08C] font-rounded text-lg capitalize">
          {formatMonthLabel(entry.month)}
        </h3>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full ${events[i] ? "bg-[#707AD6]" : "bg-[#B7A08C]/20"}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="bg-[hsl(var(--card-foreground))] mt-0.5 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span className="text-[#F8F0E5] text-xs font-semibold">{i + 1}</span>
            </div>
            {editing === i ? (
              <input
                ref={inputRef}
                autoFocus
                className="flex-1 text-[#B7A08C] text-sm font-body bg-transparent border-b border-[#B7A08C]/40 outline-none pb-1"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => handleSave(i)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(i); if (e.key === "Escape") setEditing(null); }}
                disabled={saving}
              />
            ) : (
              <p
                className={`text-sm font-body leading-relaxed ${events[i] ? "text-[#B7A08C]" : "text-[#B7A08C]/30"} ${isCurrent ? "cursor-text" : ""}`}
                onClick={() => handleEdit(i)}
              >
                {events[i] || (isCurrent ? "Tap to add a highlight…" : "—")}
              </p>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}