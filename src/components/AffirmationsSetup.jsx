import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";

export default function AffirmationsSetup({ onComplete }) {
  const [affirmations, setAffirmations] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (i, val) => {
    const updated = [...affirmations];
    updated[i] = val;
    setAffirmations(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const updates = {
      affirmation_1: affirmations[0].trim() || "I am enough.",
      affirmation_2: affirmations[1].trim() || "I am growing every day.",
      affirmation_3: affirmations[2].trim() || "I choose joy.",
    };
    await base44.auth.updateMe(updates);
    const current = queryClientInstance.getQueryData(["current-user"]);
    queryClientInstance.setQueryData(["current-user"], { ...current, ...updates });
    setLoading(false);
    onComplete();
  };

  const placeholders = [
    "e.g. I am enough.",
    "e.g. I deserve happiness.",
    "e.g. I am growing every day.",
  ];

  return (
    <div className="fixed inset-0 bg-[#707AD6] flex items-center justify-center px-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-[#F9EFE4] text-3xl font-rounded mb-2">
          Your affirmations
        </h1>
        <p className="text-[#F9EFE4]/80 text-sm font-body mb-8">
          3 positive truths about yourself. They'll stay with you every day.
        </p>

        <div className="bg-[#F9EFE4] rounded-3xl p-6 shadow-md space-y-4">
          {affirmations.map((val, i) => (
            <div key={i}>
              <p className="text-[#B7A08C]/50 text-xs font-body mb-1">{i + 1}.</p>
              <input
                type="text"
                value={val}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder={placeholders[i]}
                className="w-full bg-transparent text-[#B7A08C] placeholder-[#B7A08C]/40 
                           text-base font-body outline-none border-b border-[#B7A08C]/20 pb-2"
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#727AD0] text-[#F9EFE4] rounded-2xl py-4 text-sm font-semibold font-body 
                       hover:bg-[#1A215B] transition-colors disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
            ) : (
              "Let's go →"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}