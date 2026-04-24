import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import DayCard from "../components/DayCard";

export default function History() {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["gratitude-history"],
    queryFn: async () => {
      const user = await base44.auth.me();
      return base44.entities.GratitudeEntry.filter(
        { created_by: user.email },
        "-date",
        100
      );
    },
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-14">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[#3E47AB] text-sm font-medium uppercase tracking-widest mb-2 font-body">
          Ton parcours
        </p>
        <h1 className="text-[#F9EFE4] text-3xl font-heading font-bold">
          Historique
        </h1>
        {entries.length > 0 && (
          <p className="text-[#F9EFE4]/60 text-sm mt-2 font-body">
            {entries.length} jour{entries.length > 1 ? "s" : ""} enregistré
            {entries.length > 1 ? "s" : ""}
          </p>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-[#F9EFE4]/30 border-t-[#F9EFE4] rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-[#F9EFE4]/60 text-lg font-body">
            Aucune entrée pour l'instant
          </p>
          <p className="text-[#F9EFE4]/40 text-sm mt-2 font-body">
            Commence par noter tes moments positifs du jour !
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <DayCard key={entry.id} entry={entry} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}