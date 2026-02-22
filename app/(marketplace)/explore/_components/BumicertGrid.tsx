"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BumicertCard, BumicertCardSkeleton, cardVariants } from "./BumicertCard";
import type { MockBumicert } from "@/lib/mock-data";
import { LeafIcon } from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function BumicertGrid({
  bumicerts,
  loading = false,
}: {
  bumicerts: MockBumicert[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <BumicertCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (bumicerts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center justify-center py-24 px-4 gap-3 text-center"
      >
        <LeafIcon className="h-10 w-10 text-muted-foreground/30" />
        <h3 className="font-serif text-xl font-bold text-muted-foreground">
          No bumicerts found.
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Try a different search or filter to discover regenerative projects.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="bumicert-grid"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 p-4"
    >
      <AnimatePresence mode="popLayout">
        {bumicerts.map((bumicert) => (
          <BumicertCard key={bumicert.id} bumicert={bumicert} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
