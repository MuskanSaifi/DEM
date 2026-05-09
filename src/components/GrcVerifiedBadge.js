import { ShieldCheck } from "lucide-react";

/** Shown when the seller has an active admin-issued GRC certificate (`isCertified`). */
export default function GrcVerifiedBadge({
  size = "default",
  className = "",
}) {
  const isSm = size === "sm";
  return (
    <span
      className={`pointer-events-none inline-flex items-center gap-1 rounded-full bg-emerald-600 font-bold text-white shadow-md shadow-emerald-200/80 ${isSm ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"} ${className}`}
      title="GRC certified seller — valid certificate on file"
    >
      <ShieldCheck
        className={isSm ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"}
        strokeWidth={2.5}
        aria-hidden
      />
      GRC Verified
    </span>
  );
}
