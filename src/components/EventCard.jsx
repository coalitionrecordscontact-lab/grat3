import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function EventCard({ index, value, onSave, saved, locked }) {
  const [text, setText] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  // Sync value from parent only when not actively editing,
  // so a re-fetch can't overwrite text the user is currently typing.
  React.useEffect(() => {
    if (!isFocused) {
      setText(value || "");
    }
  }, [value, isFocused]);

  const numbers = ["01", "02", "03"];

  const inputRef = React.useRef(null);

  // Keep latest values accessible from the unmount cleanup
  const textRef = React.useRef(text);
  const valueRef = React.useRef(value);
  const onSaveRef = React.useRef(onSave);
  const lockedRef = React.useRef(locked);
  textRef.current = text;
  valueRef.current = value;
  onSaveRef.current = onSave;
  lockedRef.current = locked;

  // Save any unsaved text to the backend BEFORE unmount (tab change, navigation),
  // because onBlur doesn't reliably fire on iOS when the component is removed.
  React.useEffect(() => {
    return () => {
      if (inputRef.current) inputRef.current.blur();
      if (lockedRef.current) return;
      const t = (textRef.current || "").trim();
      if (t && t !== (valueRef.current || "")) {
        onSaveRef.current(t);
      }
    };
  }, []);

  const handleSave = () => {
    if (inputRef.current) inputRef.current.blur();
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
        } ${saved && !locked ? "ring-2 ring-[#707AD6]/20" : ""} ${locked ? "opacity-80" : ""}`}
      >
        <span className="text-[#B7A08C]/40 text-xs font-semibold font-body flex-shrink-0 w-6">
          {numbers[index]}
        </span>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          readOnly={locked}
          className="flex-1 bg-transparent text-[#B7A08C] placeholder-[#B7A08C]/30 
                     text-base font-body outline-none min-w-0"
          style={{ fontSize: "16px" }}
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