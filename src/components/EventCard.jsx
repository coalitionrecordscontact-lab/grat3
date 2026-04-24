import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

export default function EventCard({ index, value, onSave, saved }) {
  const [text, setText] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  const labels = [
    "Premier moment positif ✨",
    "Deuxième moment positif 🌟",
    "Troisième moment positif 💫",
  ];

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
    setIsFocused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
    >
      <div
        className={`bg-[#F9EFE4] rounded-3xl p-6 transition-all duration-300 ${
          isFocused ? "shadow-xl scale-[1.02]" : "shadow-md"
        } ${saved ? "ring-2 ring-[#707AD6]/30" : ""}`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-[#B7A08C] text-xs font-medium uppercase tracking-widest">
            Moment {index + 1}
          </span>
          {saved && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-[#707AD6] flex items-center justify-center"
            >
              <Check className="w-3.5 h-3.5 text-[#F9EFE4]" />
            </motion.div>
          )}
        </div>

        <p className="text-[#B7A08C]/60 text-sm mb-3 font-body">
          {labels[index]}
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleSave}
          placeholder="Écris ton moment positif ici..."
          rows={3}
          className="w-full bg-transparent text-[#B7A08C] placeholder-[#B7A08C]/30 
                     text-base font-body leading-relaxed resize-none outline-none 
                     border-b border-[#B7A08C]/10 focus:border-[#707AD6]/30 
                     transition-colors pb-2"
          readOnly={saved}
        />

        {!saved && text.trim() && !isFocused && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => onSave(text.trim())}
            className="mt-3 flex items-center gap-2 text-[#707AD6] text-sm font-medium 
                       hover:text-[#3E47AB] transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Enregistrer
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}