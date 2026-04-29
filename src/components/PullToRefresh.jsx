import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, THRESHOLD], [0, 1]);
  const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);

  const handleTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      y.set(Math.min(delta * 0.45, THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (y.get() >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      y.set(THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    y.set(0);
    startY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <motion.div
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-10"
        style={{ top: -40, opacity, scale }}
      >
        <div className="w-8 h-8 border-2 border-[#F9EFE4]/40 border-t-[#F9EFE4] rounded-full animate-spin" />
      </motion.div>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}