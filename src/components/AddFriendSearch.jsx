import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { UserPlus, Search, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddFriendSearch({ currentUser, following, onFollow }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null); // null | "not_found" | user object
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await base44.functions.invoke("searchUserByUsername", { username: query.trim() });
      const data = res.data;
      if (!data.found) {
        setResult("not_found");
      } else if (data.user.email === currentUser.email) {
        setResult("self");
      } else {
        setResult(data.user);
      }
    } catch (e) {
      setResult("not_found");
    }
    setLoading(false);
  };

  const handleFollow = async () => {
    if (!result || result === "not_found" || result === "self") return;
    setAdding(true);
    await base44.entities.Friendship.create({
      follower_email: currentUser.email,
      following_email: result.email,
      following_username: result.username,
    });
    onFollow(result.email);
    setQuery("");
    setResult(null);
    setAdding(false);
  };

  const alreadyFollowing = result && result !== "not_found" && result !== "self"
    && following.includes(result.email);

  return (
    <div className="bg-[#F9EFE4] rounded-3xl p-5 shadow-md mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#707AD6]/10 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-[#727AD0]" />
        </div>
        <div>
          <h3 className="text-[#727AD0] font-heading font-semibold text-base">Add a friend</h3>
          <p className="text-[#727AD0]/60 text-xs font-body">Search by username</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setResult(null); }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="e.g. sunshine_42"
          className="flex-1 bg-[#F9EFE4] border border-[#B7A08C]/30 rounded-xl px-4 py-2.5 
                     text-[#B7A08C] placeholder-[#B7A08C]/40 text-sm font-body outline-none 
                     focus:border-[#727AD0]/50"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-[#727AD0] text-[#F9EFE4] rounded-xl px-4 py-2.5 disabled:opacity-50 
                     hover:bg-[#1A215B] transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            {result === "not_found" || result === "self" ? (
              <p className="text-red-400 text-xs font-body flex items-center gap-1">
                <X className="w-3 h-3" />
                {result === "self" ? "That's you!" : "No user found with this username."}
              </p>
            ) : alreadyFollowing ? (
              <p className="text-[#727AD0] text-xs font-body flex items-center gap-1">
                <Check className="w-3 h-3" /> Already following @{result.username}
              </p>
            ) : (
              <div className="flex items-center justify-between bg-[#707AD6]/8 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#707AD6] flex items-center justify-center">
                    <span className="text-[#F9EFE4] text-xs font-bold uppercase">
                      {result.username?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-[#B7A08C] text-sm font-semibold font-body">@{result.username}</span>
                </div>
                <button
                  onClick={handleFollow}
                  disabled={adding}
                  className="bg-[#727AD0] text-[#F9EFE4] rounded-lg px-3 py-1.5 text-xs font-semibold 
                             font-body hover:bg-[#1A215B] transition-colors disabled:opacity-50"
                >
                  {adding ? "..." : "Follow"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}