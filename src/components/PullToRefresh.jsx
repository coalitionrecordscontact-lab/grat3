import React, { useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { RefreshCw } from "lucide-react";

const THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, THRESHOLD], [0, 1]);
  const rotate = useTransform(y, [0, THRESHOLD], [0, 180]);
  const scale = useTransform(y, [0, THRESHOLD], [0.5, 1]);

  const handleTouchStart = (e) => {
    // Only allow pull when scrolled to top
    const el = e.currentTarget;
    if (el.scrollTop > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (startY.current === null || refreshing) return;
    const el = e.currentTarget;
    if (el.scrollTop > 0) { startY.current = null; return; }
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      // Rubber-band resistance
      y.set(Math.min(delta * 0.45, THRESHOLD + 20));
    }
  };

  const handleTouchEnd = async () => {
    if (startY.current === null) return;
    startY.current = null;
    if (y.get() >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      animate(y, THRESHOLD * 0.7, { duration: 0.15 });
      try {
        await onRefresh();
      } catch (_) {
        // ignore refresh errors
      } finally {
        setRefreshing(false);
      }
    }
    animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
  };

  return (
    <div
      className="relative overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        style={{ opacity, y: useTransform(y, (v) => v - 48) }}
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-10"
      >
        <motion.div style={{ scale }} className="bg-[#F9EFE4]/20 backdrop-blur-sm rounded-full p-2">
          <motion.div style={{ rotate }}>
            <RefreshCw
              className={`w-5 h-5 text-[#F9EFE4] ${refreshing ? "animate-spin" : ""}`}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Page content pushed down while pulling */}
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}