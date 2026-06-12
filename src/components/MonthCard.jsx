import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { format, parseISO } from "date-fns";

function formatMonthLabel(monthStr) {
  if (!monthStr || typeof monthStr !== "string") return "";
  const date = parseISO(monthStr + "-01");
  if (isNaN(date.getTime())) return monthStr;
  return format(date, "MMMM yyyy");
}

export default function MonthCard({ entry, index, isCurrent, onUpdated }) {
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [localEvents, setLocalEvents] = useState([entry.event_1, entry.event_2, entry.event_3]);
  const inputRef = useRef(null);
  const localIdRef = useRef(entry.id || null);
  const editingRef = useRef(null);
  editingRef.current = editing;

  useEffect(() => {
    localIdRef.current = entry.id || localIdRef.current;
    // Never overwrite what the user is currently typing
    if (editingRef.current === null) {
      setLocalEvents([entry.event_1, entry.event_2, entry.event_3]);
    }
  }, [entry.id, entry.event_1, entry.event_2, entry.event_3]);

  // Keep latest values accessible from the unmount cleanup
  const draftRef = useRef("");
  const eventsRef = useRef(localEvents);
  const onUpdatedRef = useRef(onUpdated);
  draftRef.current = draft;
  eventsRef.current = localEvents;
  onUpdatedRef.current = onUpdated;

  // Deduplicated persistence: prevents double-saves (Enter + blur both firing)
  // and parallel creates that produce duplicate MonthlyEntry records.
  const persistRef = useRef({ creating: null, lastSaved: {} });

  const persistField = async (i, value) => {
    const field = `event_${i + 1}`;
    if (persistRef.current.lastSaved[field] === value) return;
    persistRef.current.lastSaved[field] = value;
    let saved;
    if (localIdRef.current) {
      saved = await base44.entities.MonthlyEntry.update(localIdRef.current, { [field]: value });
    } else if (persistRef.current.creating) {
      const created = await persistRef.current.creating;
      saved = await base44.entities.MonthlyEntry.update(created.id, { [field]: value });
    } else {
      persistRef.current.creating = base44.entities.MonthlyEntry.create({ month: entry.month, [field]: value });
      saved = await persistRef.current.creating;
      localIdRef.current = saved.id;
      persistRef.current.creating = null;
    }
    onUpdatedRef.current(saved);
  };

  // Save any in-progress edit to the backend BEFORE unmount (tab change),
  // because onBlur doesn't reliably fire on iOS when the component is removed.
  useEffect(() => {
    return () => {
      if (inputRef.current) inputRef.current.blur();
      const i = editingRef.current;
      if (i === null) return;
      const value = (draftRef.current || "").trim();
      if (!value || value === (eventsRef.current[i] || "")) return;
      persistField(i, value).catch(() => {});
    };
  }, []);

  const events = localEvents;

  const handleEdit = (i) => {
    if (!isCurrent) return;
    setEditing(i);
    setDraft(events[i] || "");
  };

  const handleSave = (i) => {
    setEditing(null);
    const value = draft.trim();
    if (!value || value === (events[i] || "")) return;
    setLocalEvents((prev) => prev.map((event, idx) => (idx === i ? value : event)));
    persistField(i, value).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.08, 0.6), duration: 0.4 }}
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
              className={`w-4 h-4 rounded-full transition-colors ${events[i] ? "bg-[#707AD6]" : "bg-[#B7A08C]/20"}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="bg-[#B7A08C]/20 mt-0.5 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span className="text-[#707AD6] text-xs font-semibold">{i + 1}</span>
            </div>
            {editing === i ? (
              <input
                ref={inputRef}
                autoFocus
                className="flex-1 text-[#B7A08C] text-sm font-body bg-transparent border-b border-[#B7A08C]/40 outline-none pb-1"
                style={{ fontSize: "16px" }}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => handleSave(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.target.blur();
                  if (e.key === "Escape") setEditing(null);
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => isCurrent && handleEdit(i)}
                className={`flex-1 text-left text-sm font-body leading-relaxed bg-transparent border-none outline-none p-0 ${events[i] ? "text-[#B7A08C]" : "text-[#B7A08C]/30"}`}
              >
                {events[i] || (isCurrent ? "Tap to add a highlight…" : "—")}
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}