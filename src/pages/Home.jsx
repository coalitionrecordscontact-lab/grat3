import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import EventCard from "../components/EventCard";
import PullToRefresh from "../components/PullToRefresh";
import AffirmationsCarousel from "../components/AffirmationsCarousel";

function getTodayString() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function Home() {
  const queryClient = useQueryClient();
  const today = getTodayString();
  const [username, setUsername] = React.useState(null);
  const [affirmations, setAffirmations] = React.useState([]);
  const [showCarousel, setShowCarousel] = React.useState(false);

  React.useEffect(() => {
    base44.auth.me().then((me) => {
      if (!me) return;
      // auth.me() returns built-in fields; custom fields like username are also included
      if (me.username) setUsername(me.username);
      setAffirmations([me.affirmation_1, me.affirmation_2, me.affirmation_3].filter(Boolean));
    });
  }, []);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["gratitude", today],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.GratitudeEntry.filter(
        { date: today, created_by_id: user.id },
        "-created_date",
        1
      );
    },
    initialData: [],
    staleTime: 30000, // keep data fresh 30s — prevents blank flash on invalidate
  });

  const todayEntry = Array.isArray(entries) && entries.length > 0 ? entries[0] : null;
  const allSaved = !!(todayEntry?.event_1 && todayEntry?.event_2 && todayEntry?.event_3);
  // validated = persistent: if all 3 are saved in DB, day is always completed (survives app restart)
  const validated = allSaved && !!todayEntry?.is_complete;

  const saveMutation = useMutation({
    mutationFn: async ({ field, value }) => {
      if (todayEntry) {
        return base44.entities.GratitudeEntry.update(todayEntry.id, { [field]: value });
      } else {
        return base44.entities.GratitudeEntry.create({ date: today, [field]: value, is_complete: false });
      }
    },
    onMutate: async ({ field, value }) => {
      // Optimistic update: immediately reflect the new value in cache
      await queryClient.cancelQueries({ queryKey: ["gratitude", today] });
      const previous = queryClient.getQueryData(["gratitude", today]);
      queryClient.setQueryData(["gratitude", today], (old) => {
        const arr = Array.isArray(old) ? old : [];
        if (arr.length > 0) {
          return [{ ...arr[0], [field]: value }];
        }
        return [{ date: today, [field]: value, is_complete: false }];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["gratitude", today], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["gratitude", today] });
    }
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
          className="mb-10">
          
        <h1 className="text-[#F9EFE4] text-3xl font-rounded leading-tight">
          Your 3 positive
          <br />
          moments today
        </h1>
        {username &&
          <p className="text-[#F9EFE4]/60 text-sm font-body mt-2">@{username}</p>
        }

      </motion.div>

      {isLoading ?
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
        </div> :

        <div className="space-y-5">
          {[0, 1, 2].map((i) =>
          <EventCard
            key={i}
            index={i}
            value={todayEntry?.[`event_${i + 1}`] || ""}
            saved={!!todayEntry?.[`event_${i + 1}`]}
            locked={validated}
            onSave={(value) => handleSave(i, value)} />

          )}
        </div>
        }

      <AnimatePresence>
        {allSaved && !validated &&
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-8">
            
            <button
              onClick={async () => {
                // Persist validation in DB so it survives app restart
                if (todayEntry) {
                  await base44.entities.GratitudeEntry.update(todayEntry.id, { is_complete: true });
                  queryClient.invalidateQueries({ queryKey: ["gratitude", today] });
                }
                if (affirmations.length > 0) setShowCarousel(true);
              }}
              className="w-full font-rounded text-base rounded-2xl py-4 shadow-md active:scale-95 transition-transform text-[#807AC7] bg-[#F8F0E5]">
              
              validate
            </button>
          </motion.div>
          }
        {validated && !showCarousel &&
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8 text-center">
            
            <div className="inline-flex items-center gap-2 bg-[#F9EFE4]/20 backdrop-blur-sm rounded-full px-6 py-3">
              <Sparkles className="w-5 h-5 text-[#F9EFE4]" />
              <span className="text-[#F9EFE4] font-medium text-sm font-body">
                You've completed your day
              </span>
            </div>
          </motion.div>
          }
      </AnimatePresence>

      <AnimatePresence>
        {showCarousel && affirmations.length > 0 &&
          <AffirmationsCarousel
            affirmations={affirmations}
            onClose={() => setShowCarousel(false)} />

          }
      </AnimatePresence>
    </div>
    </PullToRefresh>);

}