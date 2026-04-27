import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function EventCard({ index, value, onSave, saved }) {
  const [text, setText] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  const numbers = ["01", "02", "03"];

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    }
    setIsFocused(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.4, ease: "easeOut" }}
    >
      <div
        className={`bg-[#F9EFE4] rounded-2xl px-5 py-5 transition-all duration-300 flex items-center gap-4 ${
          isFocused ? "shadow-xl scale-[1.01]" : "shadow-md"
        } ${saved ? "ring-2 ring-[#707AD6]/20" : ""}`}
      >
        <span className="text-[#B7A08C]/40 text-xs font-semibold font-body flex-shrink-0 w-6">
          {numbers[index]}
        </span>

        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          readOnly={saved}
          className="flex-1 bg-transparent text-[#B7A08C] placeholder-[#B7A08C]/30 
                     text-base font-body outline-none min-w-0"
          placeholder={`Positive moment ${index + 1}...`}
        />

        {saved && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full bg-[#707AD6] flex items-center justify-center flex-shrink-0"
          >
            <Check className="w-3 h-3 text-[#F9EFE4]" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}