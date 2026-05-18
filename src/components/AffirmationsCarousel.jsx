import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function AffirmationsCarousel({ affirmations, onClose }) {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < affirmations.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      onClose();
    }
  };

  const remaining = affirmations.length - 1 - current;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#707AD6]/90 backdrop-blur-sm px-6"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-10 right-6 text-[#F9EFE4]/60 hover:text-[#F9EFE4] transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative flex items-center justify-center" style={{ width: 200, height: 320 }}>
        {/* Stacked cards behind */}
        {[...Array(Math.min(remaining, 2))].map((_, i) => (
          <div
            key={i}
            className="absolute bg-[#F9EFE4] rounded-3xl shadow-xl"
            style={{
              width: 200,
              height: 300,
              transform: `translateY(${(i + 1) * 10}px) scale(${1 - (i + 1) * 0.04})`,
              opacity: 1 - (i + 1) * 0.25,
              zIndex: 10 - i,
            }}
          />
        ))}

        {/* Active card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -20 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            onClick={handleNext}
            className="absolute bg-[#F9EFE4] rounded-3xl shadow-2xl cursor-pointer flex flex-col items-center justify-center px-6 py-10 text-center select-none"
            style={{ width: 200, height: 300, zIndex: 20 }}
          >
            <p className="text-[#B7A08C]/50 text-xs font-rounded uppercase tracking-widest mb-6">
              {current + 1} / {affirmations.length}
            </p>
            <p className="text-[#1A215B] text-lg font-heading italic leading-relaxed">
              "{affirmations[current]}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="absolute bottom-16 flex gap-2">
        {affirmations.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current ? "bg-[#F9EFE4] w-4" : "bg-[#F9EFE4]/30"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}