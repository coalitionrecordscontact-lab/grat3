import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle, Copy, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function FontUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = async (files) => {
    const fontFiles = Array.from(files).filter((f) =>
      f.name.match(/\.(ttf|otf|woff|woff2)$/i)
    );
    if (!fontFiles.length) return;

    setUploading(true);
    const results = [];
    for (const file of fontFiles) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      results.push({ name: file.name, url: file_url });
    }
    setUploaded((prev) => [...prev, ...results]);
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-[#707AD6] pb-28 px-5 pt-14">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-[#8D92D4] text-sm font-medium uppercase tracking-widest mb-2 font-body">
          Settings
        </p>
        <h1 className="text-[#F9EFE4] text-3xl font-heading font-bold">
          Font Upload
        </h1>
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`bg-[#F9EFE4] rounded-3xl p-8 shadow-md mb-6 flex flex-col items-center gap-4 cursor-pointer transition-all duration-200 ${
          dragging ? "ring-4 ring-[#707AD6]/40 scale-[1.01]" : ""
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="w-14 h-14 rounded-full bg-[#707AD6]/10 flex items-center justify-center">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-[#707AD6]/30 border-t-[#707AD6] rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-[#707AD6]" />
          )}
        </div>
        <div className="text-center">
          <p className="text-[#B7A08C] font-heading font-semibold text-base">
            {uploading ? "Uploading…" : "Drop your font here"}
          </p>
          <p className="text-[#B7A08C]/50 text-xs font-body mt-1">
            .ttf, .otf, .woff, .woff2
          </p>
        </div>
      </motion.div>

      {/* Uploaded fonts */}
      {uploaded.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <p className="text-[#8D92D4] text-xs uppercase tracking-widest mb-3 font-body">
            Uploaded fonts
          </p>
          <div className="space-y-3">
            {uploaded.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-[#F9EFE4] rounded-2xl px-5 py-4 shadow-md flex items-center gap-3"
              >
                <FileText className="w-5 h-5 text-[#707AD6] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[#B7A08C] text-sm font-semibold font-body truncate">
                    {f.name}
                  </p>
                  <p className="text-[#B7A08C]/40 text-xs font-body truncate">{f.url}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(f.url)}
                  className="text-[#707AD6] hover:text-[#1A215B] transition-colors"
                  title="Copy URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <CheckCircle className="w-5 h-5 text-[#707AD6] flex-shrink-0" />
              </motion.div>
            ))}
          </div>
          <p className="text-[#8D92D4]/70 text-xs font-body mt-4 text-center">
            Copy the URL and share it with your developer to use this font.
          </p>
        </motion.div>
      )}
    </div>
  );
}