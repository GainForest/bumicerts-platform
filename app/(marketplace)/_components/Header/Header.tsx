"use client";

import { useHeaderContext } from "./context";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const { leftContent, rightContent, subHeaderContent } = useHeaderContext();

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="h-14 flex items-center justify-between px-4 gap-3">
        {/* Left slot */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <AnimatePresence mode="wait">
            {leftContent ? (
              <motion.div
                key="left-content"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex-1 min-w-0"
              >
                {leftContent}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Right slot */}
        <div className="flex items-center gap-2 shrink-0">
          <AnimatePresence mode="wait">
            {rightContent ? (
              <motion.div
                key="right-content"
                initial={{ opacity: 0, x: 4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {rightContent}
              </motion.div>
            ) : null}
          </AnimatePresence>
          <ThemeToggle />
        </div>
      </div>

      {/* Sub-header slot */}
      <AnimatePresence>
        {subHeaderContent && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="border-t border-border overflow-hidden"
          >
            <div className="px-4 py-2">{subHeaderContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
