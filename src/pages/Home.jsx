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
  const [affirmations, setAffirmations] = React.useState([]);
  const [showCarousel, setShowCarousel] = React.useState(false);
  // Use a ref for entryId so it's always up-to-date synchronously inside mutationFn
  const entryIdRef = React.useRef(null);
  // Holds the in-flight create promise to prevent concurrent duplicate creates
  const createPromiseRef = React.useRef(null);

  // Single source of truth for current user
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
    staleTime: 60000,
  });

  React.useEffect(() => {
    if (!currentUser) return;
    setAffirmations([currentUser.affirmation_1, currentUser.affirmation_2, currentUser.affirmation_3].filter(Boolean));
  }, [currentUser]);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["gratitude", today, currentUser?.id],
    enabled: !!currentUser?.id,
    queryFn: async () => {
      return base44.entities.GratitudeEntry.filter(
        { date: today, created_by_id: currentUser.id },
        "-created_date",
        1
      );
    },
    initialData: [],
    staleTime: 30000,
  });

  const todayEntry = Array.isArray(entries) && entries.length > 0 ? entries[0] : null;

  // Sync entryIdRef from DB entry whenever it changes
  if (todayEntry?.id) {
    entryIdRef.current = todayEntry.id;
  }

  const allSaved = !!(todayEntry?.event_1 && todayEntry?.event_2 && todayEntry?.event_3);
  const validated = allSaved && !!todayEntry?.is_complete;

  const saveMutation = useMutation({
    mutationFn: async ({ field, value }) => {
      // Already have an entry → just update
      if (entryIdRef.current) {
        return base44.entities.GratitudeEntry.update(entryIdRef.current, { [field]: value });
      }
      // A create is already in flight → wait for it, then update the same record
      if (createPromiseRef.current) {
        const existing = await createPromiseRef.current;
        return base44.entities.GratitudeEntry.update(existing.id, { [field]: value });
      }
      // First write of the day → create exactly one record
      createPromiseRef.current = base44.entities.GratitudeEntry.create({
        date: today,
        [field]: value,
        is_complete: false,
      });
      const created = await createPromiseRef.current;
      entryIdRef.current = created.id;
      return created;
    },
    onMutate: async ({ field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["gratitude", today, currentUser?.id] });
      const previous = queryClient.getQueryData(["gratitude", today, currentUser?.id]);
      queryClient.setQueryData(["gratitude", today, currentUser?.id], (old) => {
        const arr = Array.isArray(old) ? old : [];
        if (arr.length > 0) {
          return [{ ...arr[0], [field]: value }];
        }
        return [{ date: today, [field]: value, is_complete: false }];
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["gratitude", today, currentUser?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["gratitude", today, currentUser?.id] });
    },
  });

  const handleSave = (index, value) => {
    const field = `event_${index + 1}`;
    saveMutation.mutate({ field, value });
  };

  const handleRefresh = () =>
    queryClient.invalidateQueries({ queryKey: ["gratitude", today, currentUser?.id] });

  const username = currentUser?.username || currentUser?.data?.username || null;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-[#F9EFE4] text-3xl font-rounded leading-tight">
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
            <div className="w-8 h-8 border-2 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {[0, 1, 2].map((i) => (
              <EventCard
                key={i}
                index={i}
                value={todayEntry?.[`event_${i + 1}`] || ""}
                saved={!!todayEntry?.[`event_${i + 1}`]}
                locked={validated}
                onSave={(value) => handleSave(i, value)}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {allSaved && !validated && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              <button
                onClick={async () => {
                  const id = entryIdRef.current ?? todayEntry?.id;
                  if (!id) {
                    console.warn("No entry id found, cannot validate");
                    return;
                  }
                  try {
                    await base44.entities.GratitudeEntry.update(id, { is_complete: true });
                    await queryClient.invalidateQueries({ queryKey: ["gratitude", today, currentUser?.id] });
                    if (affirmations.length > 0) setShowCarousel(true);
                  } catch (err) {
                    console.error("Validation failed:", err);
                  }
                }}
                className="w-full font-rounded text-base rounded-2xl py-4 shadow-md active:scale-95 transition-transform text-[#807AC7] bg-[#F8F0E5]"
              >
                validate
              </button>
            </motion.div>
          )}
          {validated && !showCarousel && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-[#F9EFE4]/20 backdrop-blur-sm rounded-full px-6 py-3">
                <Sparkles className="w-5 h-5 text-[#F9EFE4]" />
                <span className="text-[#F9EFE4] font-medium text-sm font-body">
                  You've completed your day
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCarousel && affirmations.length > 0 && (
            <AffirmationsCarousel
              affirmations={affirmations}
              onClose={() => setShowCarousel(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </PullToRefresh>
  );
}