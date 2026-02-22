"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { ArrowRightIcon, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getStripedBackground } from "@/lib/getStripedBackground";
import type { MockBumicert } from "@/lib/mock-data";

// Striped header background
function StripedHeader({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-full h-10", className)}
      style={{
        background: getStripedBackground(
          { variable: "--color-foreground", opacity: 3 },
          { variable: "--color-foreground", opacity: 6 },
          2,
          15
        ),
      }}
    />
  );
}

// Item variants for stagger
export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    filter: "blur(4px)",
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut" as const,
    },
  },
};

export function BumicertCard({ bumicert }: { bumicert: MockBumicert }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/bumicert/${encodeURIComponent(bumicert.id)}`}>
        <motion.div
          onHoverStart={() => setHovered(true)}
          onHoverEnd={() => setHovered(false)}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="group rounded-2xl border border-border bg-card overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-300"
        >
          {/* Striped header */}
          <StripedHeader />

          {/* Card image area */}
          <div className="relative flex items-center justify-center bg-muted/30 py-4 px-4">
            {/* The certificate art */}
            <div
              className="rounded-3xl shadow-2xl bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 p-1.5"
              style={{
                viewTransitionName: `bumicert-img-${bumicert.id.replace(/[^a-z0-9]/gi, "-")}`,
              }}
            >
              <div className="w-[220px] h-[308px] relative overflow-hidden rounded-2xl">
                <Image
                  src={bumicert.coverImage}
                  alt={bumicert.title}
                  fill
                  className="object-cover scale-105 group-hover:scale-100 group-hover:brightness-105 transition-all duration-500 ease-out"
                />
                {/* Bottom gradient */}
                <div
                  className="rounded-b-2xl absolute inset-0 top-[45%] bg-black/60 backdrop-blur-md"
                  style={{
                    maskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 40%)",
                  }}
                />
                {/* Logo */}
                <div className="absolute top-2.5 left-2.5 h-8 w-8 rounded-full bg-white border-2 border-black/10 shadow-lg overflow-hidden">
                  <Image
                    src={bumicert.logoUrl}
                    alt="Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Bottom content */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                  <p className="font-serif font-semibold text-white text-lg leading-tight [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
                    {bumicert.title.slice(0, 45)}{bumicert.title.length > 45 ? "…" : ""}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {bumicert.objectives.slice(0, 2).map((obj) => (
                      <span
                        key={obj}
                        className="text-[10px] bg-white/35 text-white backdrop-blur-sm rounded px-1.5 py-0.5 font-medium"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* "View →" CTA slides up on hover */}
            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={hovered ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-3 right-3 flex items-center gap-1 text-primary text-xs font-medium"
            >
              <span>View</span>
              <ArrowRightIcon className="h-3 w-3" />
            </motion.div>
          </div>

          {/* Card info footer */}
          <div className="px-4 py-3 border-t border-border">
            <p className="font-serif text-sm font-bold text-foreground leading-snug line-clamp-2">
              {bumicert.title}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 mb-1">
              {bumicert.organizationName}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              <span>{format(bumicert.startDate, "MMM d, y")}</span>
              <span className="mx-0.5">→</span>
              <span>{format(bumicert.endDate, "MMM d, y")}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function BumicertCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <StripedHeader />
      <div className="flex items-center justify-center py-4 px-4">
        <div className="w-[220px] h-[308px] rounded-3xl bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
      <div className="px-4 py-3 border-t border-border space-y-2">
        <div className="h-4 w-3/4 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-3 w-1/2 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
        <div className="h-3 w-2/3 rounded bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}
