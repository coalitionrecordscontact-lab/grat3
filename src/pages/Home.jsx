import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import EventCard from "../components/EventCard";
import PullToRefresh from "../components/PullToRefresh";

function getTodayString() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function Home() {
  const queryClient = useQueryClient();
  const today = getTodayString();
  const [username, setUsername] = React.useState("");

  React.useEffect(() => {
    base44.auth.me().then((me) => setUsername(me.username || ""));
  }, []);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["gratitude", today],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.GratitudeEntry.filter(
        { date: today, created_by: user.email },
        "-created_date",
        1
      );
    },
    initialData: [],
  });

  const todayEntry = entries.length > 0 ? entries[0] : null;
  const allSaved =
    todayEntry?.event_1 && todayEntry?.event_2 && todayEntry?.event_3;

  const saveMutation = useMutation({
    mutationFn: async ({ field, value }) => {
      if (todayEntry) {
        return base44.entities.GratitudeEntry.update(todayEntry.id, {
          [field]: value,
          is_complete:
            field === "event_3"
              ? !!(todayEntry.event_1 && todayEntry.event_2 && value)
              : field === "event_2"
              ? !!(todayEntry.event_1 && value && todayEntry.event_3)
              : !!(value && todayEntry.event_2 && todayEntry.event_3),
        });
      } else {
        return base44.entities.GratitudeEntry.create({
          date: today,
          [field]: value,
          is_complete: false,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gratitude", today] });
    },
  });

  const handleSave = (index, value) => {
    const field = `event_${index + 1}`;
    saveMutation.mutate({ field, value });
  };

  const formattedDate = format(new Date(), "EEEE, MMMM d yyyy");

  const handleRefresh = () => queryClient.invalidateQueries({ queryKey: ["gratitude", today] });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-[#F9EFE4] text-3xl font-heading font-extralight leading-tight">
          Your 3 positive
          <br />
          moments today
        </h1>
        {username && (
          <p className="text-[#F9EFE4]/60 text-sm font-body mt-2">@{username}</p>
        )}

      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <EventCard
              key={i}
              index={i}
              value={todayEntry?.[`event_${i + 1}`] || ""}
              saved={!!todayEntry?.[`event_${i + 1}`]}
              onSave={(value) => handleSave(i, value)}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {allSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 bg-[#F9EFE4]/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Sparkles className="w-5 h-5 text-[#F9EFE4]" />
              <span className="text-[#F9EFE4] font-medium text-sm font-body">
                Well done! You completed your day
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PullToRefresh>
  );
}