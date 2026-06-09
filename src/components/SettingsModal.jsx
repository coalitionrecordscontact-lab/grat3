import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SettingsModal({ isOpen, onClose }) {
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleReset = async () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    setResetting(true);
    const user = await base44.auth.me();
    const entries = await base44.entities.GratitudeEntry.filter({ created_by: user.email });
    await Promise.all(entries.map((e) => base44.entities.GratitudeEntry.delete(e.id)));
    const friendships = await base44.entities.Friendship.filter({ follower_email: user.email });
    await Promise.all(friendships.map((f) => base44.entities.Friendship.delete(f.id)));
    setResetting(false);
    setConfirmReset(false);
    onClose();
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    const user = await base44.auth.me();
    const entries = await base44.entities.GratitudeEntry.filter({ created_by: user.email });
    await Promise.all(entries.map((e) => base44.entities.GratitudeEntry.delete(e.id)));
    const friendships = await base44.entities.Friendship.filter({ follower_email: user.email });
    await Promise.all(friendships.map((f) => base44.entities.Friendship.delete(f.id)));
    await base44.auth.logout();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-6 overflow-y-auto"
            style={{ paddingBottom: "calc(7rem + env(safe-area-inset-bottom))", maxHeight: "92vh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[#1A215B] text-2xl font-rounded">Settings</h2>
              <button
                onClick={onClose}
                className="text-[#B7A08C] hover:text-[#1A215B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Support */}
              <a
                href="mailto:hoymansmusic@gmail.com"
                className="block w-full text-left px-5 py-4 border border-[#E0D8D0] rounded-2xl text-[#555] font-body text-base hover:bg-gray-50 transition-colors"
              >
                Support
              </a>

              {/* Help us grow */}
              <a
                href="https://www.paypal.com/ncp/payment/LLQJMDB3FU2KL"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-5 py-4 border border-[#E0D8D0] rounded-2xl text-[#555] font-body text-base hover:bg-gray-50 transition-colors"
              >
                Help us grow
              </a>

              {/* Reset */}
              <button
                onClick={handleReset}
                disabled={resetting}
                className="w-full text-left px-5 py-4 border border-red-200 rounded-2xl text-red-500 font-body text-base hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {resetting ? "Resetting..." : confirmReset ? "Tap again to confirm" : "Reset my journey"}
              </button>

              {/* Delete account */}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full text-left px-5 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-500 font-body text-base hover:bg-red-100 transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : confirmDelete ? "Tap again to confirm" : "Delete Account"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}