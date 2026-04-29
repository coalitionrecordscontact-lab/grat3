import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await base44.auth.deleteMe();
    base44.auth.logout("/");
  };

  return (
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-4">
      <PageHeader title="Settings" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6"
      >
        <div className="bg-[#F9EFE4] rounded-3xl p-5 shadow-md">
          <h2 className="text-[#B7A08C] font-heading font-semibold text-base mb-1">
            Danger Zone
          </h2>
          <p className="text-[#B7A08C]/60 text-xs font-body mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>

          {confirming && (
            <p className="text-red-400 text-sm font-body mb-3">
              Are you sure? Tap again to confirm deletion.
            </p>
          )}

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full bg-red-400 text-white rounded-2xl py-3 text-sm font-semibold font-body
                       hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {deleting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : confirming ? (
              "Yes, delete my account"
            ) : (
              "Delete Account"
            )}
          </button>

          {confirming && !deleting && (
            <button
              onClick={() => setConfirming(false)}
              className="w-full mt-2 text-[#B7A08C]/60 text-sm font-body py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}