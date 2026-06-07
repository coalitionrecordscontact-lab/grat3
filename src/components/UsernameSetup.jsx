import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";

export default function UsernameSetup({ onComplete }) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const trimmed = username.trim();
    if (!trimmed) return;
    if (trimmed.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setError("Only letters, numbers and underscores allowed.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await base44.functions.invoke("searchUserByUsername", { username: trimmed });
      if (res.data.found) {
        setError("This username is already taken. Try another.");
        setLoading(false);
        return;
      }

      await base44.auth.updateMe({ username: trimmed });
      const updated = await base44.auth.me();
      queryClientInstance.setQueryData(["current-user"], updated);

      setLoading(false);
      onComplete();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#707AD6] flex items-center justify-center px-6 z-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <h1 className="text-[#F9EFE4] text-3xl font-rounded mb-2">
          Choose your username
        </h1>
        <p className="text-[#F9EFE4]/80 text-sm font-body mb-8">
          This is how you'll appear in the community feed.
        </p>

        <div className="bg-[#F9EFE4] rounded-3xl p-6 shadow-md">
          <input
            type="text"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="e.g. sunshine_42"
            className="w-full bg-transparent text-[#B7A08C] placeholder-[#B7A08C]/40 text-base font-body outline-none border-b border-[#B7A08C]/20 pb-2 mb-4"
            autoFocus
          />
          {error && (
            <p className="text-red-400 text-xs font-body mb-3">{error}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            className="w-full bg-[#727AD0] text-[#F9EFE4] rounded-2xl py-4 text-sm font-semibold font-body hover:bg-[#1A215B] transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}