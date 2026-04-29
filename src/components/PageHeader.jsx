import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function PageHeader({ title }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 mb-2">
      <button
        onClick={() => navigate(-1)}
        className="w-9 h-9 rounded-full bg-[#F9EFE4]/20 flex items-center justify-center"
      >
        <ChevronLeft className="w-5 h-5 text-[#F9EFE4]" />
      </button>
      <h1 className="text-[#F9EFE4] text-2xl font-heading font-extralight">
        {title}
      </h1>
    </div>
  );
}