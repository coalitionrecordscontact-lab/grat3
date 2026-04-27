import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Share2, Users, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";

export default function Community() {
  const APP_URL = window.location.origin;
  const SHARE_TEXT = "Join me on this gratitude journal app! 🌟";

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Gratitude Journal", text: SHARE_TEXT, url: APP_URL });
    }
  };

  const { data: communityEntries, isLoading } = useQuery({
    queryKey: ["community-entries"],
    queryFn: async () => {
      const allEntries = await base44.entities.GratitudeEntry.list("-date", 50);
      return allEntries;
    },
    initialData: [],
  });

  // Group entries by user
  const groupedByUser = communityEntries.reduce((acc, entry) => {
    const user = entry.created_by || "Anonyme";
    if (!acc[user]) acc[user] = [];
    acc[user].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-14">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[#8D92D4] text-sm font-medium uppercase tracking-widest mb-2 font-body">
          Together
        </p>
        <h1 className="text-[#F9EFE4] text-3xl font-heading font-bold">
          Community
        </h1>
      </motion.div>

      {/* Invite Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[#F9EFE4] rounded-3xl p-6 shadow-md mb-6"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#707AD6]/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-[#707AD6]" />
          </div>
          <div>
            <h3 className="text-[#B7A08C] font-heading font-semibold text-base">
              Invite a friend
            </h3>
            <p className="text-[#B7A08C]/60 text-xs font-body">
              Share your positive moments together
            </p>
          </div>
        </div>

        <button
          onClick={handleNativeShare}
          className="w-full bg-[#707AD6] text-[#F9EFE4] rounded-2xl py-4 text-sm font-semibold font-body hover:bg-[#1A215B] transition-colors flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share with a friend
        </button>
      </motion.div>

      {/* Community Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#F9EFE4]/60" />
          <h2 className="text-[#F9EFE4]/80 text-sm font-medium font-body uppercase tracking-widest">
            Community feed
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
          </div>
        ) : Object.keys(groupedByUser).length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-[#F9EFE4]/20 mx-auto mb-4" />
            <p className="text-[#8D92D4] font-body">
              Invite your friends to share positive moments here!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByUser).map(([userEmail, userEntries], idx) => (
              <motion.div
                key={userEmail}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="bg-[#F9EFE4] rounded-3xl p-5 shadow-md"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[#707AD6] flex items-center justify-center">
                    <span className="text-[#F9EFE4] text-xs font-bold uppercase">
                      {userEmail.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[#B7A08C] text-sm font-semibold font-body">
                      {userEmail}
                    </p>
                    <p className="text-[#B7A08C]/50 text-xs font-body">
                      {userEntries.length} day{userEntries.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Show latest entry */}
                {userEntries.slice(0, 1).map((entry) => {
                  const events = [entry.event_1, entry.event_2, entry.event_3].filter(Boolean);
                  return (
                    <div key={entry.id}>
                      <p className="text-[#B7A08C]/50 text-xs mb-2 font-body">
                        {format(parseISO(entry.date), "MMMM d, yyyy")}
                      </p>
                      <div className="space-y-2">
                        {events.map((event, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Star className="w-3.5 h-3.5 text-[#707AD6] mt-0.5 flex-shrink-0 fill-[#707AD6]" />
                            <p className="text-[#B7A08C] text-sm font-body">{event}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}