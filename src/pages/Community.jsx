import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Heart } from "lucide-react";
import { format, parseISO } from "date-fns";
import AddFriendSearch from "../components/AddFriendSearch";

export default function Community() {
  const APP_URL = window.location.origin;
  const SHARE_TEXT = "Join me on this gratitude journal app! 🌟";
  const [currentUser, setCurrentUser] = useState(null);
  const [followingEmails, setFollowingEmails] = useState([]);
  const [userMap, setUserMap] = useState({});

  const handleNativeShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Gratitude Journal", text: SHARE_TEXT, url: APP_URL });
    }
  };

  // Load current user + friendships
  useEffect(() => {
    base44.auth.me().then(async (me) => {
      setCurrentUser(me);
      const friendships = await base44.entities.Friendship.filter({ follower_email: me.email });
      setFollowingEmails(friendships.map((f) => f.following_email));
    });
  }, []);

  const handleFollow = (email) => {
    setFollowingEmails((prev) => [...prev, email]);
  };

  // Fetch entries only from followed friends
  const { data: communityEntries, isLoading } = useQuery({
    queryKey: ["community-entries", followingEmails],
    queryFn: async () => {
      if (followingEmails.length === 0) return [];
      const allEntries = await base44.entities.GratitudeEntry.list("-date", 100);
      return allEntries.filter((e) => followingEmails.includes(e.created_by));
    },
    enabled: followingEmails.length > 0,
    initialData: []
  });

  // Build userMap from friendships (username stored there)
  useEffect(() => {
    base44.auth.me().then(async (me) => {
      const friendships = await base44.entities.Friendship.filter({ follower_email: me.email });
      const map = {};
      friendships.forEach((f) => {
        map[f.following_email] = f.following_username || f.following_email;
      });
      setUserMap(map);
    });
  }, [followingEmails]);

  // Group entries by user
  const groupedByUser = communityEntries.reduce((acc, entry) => {
    const user = entry.created_by || "Anonyme";
    if (!acc[user]) acc[user] = [];
    acc[user].push(entry);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8">
        <h1 className="text-[#F9EFE4] text-3xl font-heading font-extralight">
          Community
        </h1>
      </motion.div>

      {/* Add Friend Search */}
      {currentUser && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <AddFriendSearch
            currentUser={currentUser}
            following={followingEmails}
            onFollow={handleFollow}
          />
        </motion.div>
      )}



      {/* Community Feed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#F9EFE4]/60" />
          <h2 className="text-[#F9EFE4]/80 text-sm font-medium font-body uppercase tracking-widest">
            Friends feed
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
          </div>
        ) : followingEmails.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-[#F9EFE4]/20 mx-auto mb-4" />
            <p className="text-[#F9EFE4]/60 font-body">
              Search for friends above to see their moments here!
            </p>
          </div>
        ) : Object.keys(groupedByUser).length === 0 ? (
          <p className="text-[#F9EFE4]/40 text-sm font-body text-center py-6">
            Your friends haven't shared anything yet.
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByUser).map(([userEmail, userEntries], idx) => {
              const displayName = userMap[userEmail] || userEmail;
              return (
                <motion.div
                  key={userEmail}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-[#F9EFE4] rounded-3xl p-5 shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#707AD6] flex items-center justify-center">
                      <span className="text-[#F9EFE4] text-xs font-bold uppercase">
                        {displayName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-[#B7A08C] text-sm font-semibold font-body">
                        @{displayName}
                      </p>
                      <p className="text-[#B7A08C]/50 text-xs font-body">
                        {userEntries.length} day{userEntries.length > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
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
                              <div className="w-3.5 h-3.5 rounded-full bg-[#707AD6] mt-0.5 flex-shrink-0" />
                              <p className="text-[#B7A08C] text-sm font-body">{event}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}