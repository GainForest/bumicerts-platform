"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, SlidersHorizontalIcon, BuildingIcon, UsersIcon } from "lucide-react";
import { OrganizationCard } from "./OrganizationCard";
import { useHeaderContext } from "@/app/(marketplace)/_components/Header/context";
import type { MockOrganization } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const COUNTRY_MAP: Record<string, { emoji: string; name: string }> = {
  ID: { emoji: "🇮🇩", name: "Indonesia" },
  KE: { emoji: "🇰🇪", name: "Kenya" },
  CO: { emoji: "🇨🇴", name: "Colombia" },
  BR: { emoji: "🇧🇷", name: "Brazil" },
  PH: { emoji: "🇵🇭", name: "Philippines" },
};

const SORT_OPTIONS = [
  { value: "bumicerts", label: "Most Bumicerts" },
  { value: "alpha", label: "Alphabetical" },
  { value: "newest", label: "Newest" },
];

const PLACEHOLDER_TEXTS = [
  "Search by name...",
  "Search by country...",
  "Search by impact area...",
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ── Cycling placeholder ──────────────────────────────

function CyclingPlaceholder({ visible }: { visible: boolean }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PLACEHOLDER_TEXTS.length);
    }, 2500);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className="text-muted-foreground/60 text-sm pointer-events-none select-none"
        style={{ fontFamily: "var(--font-instrument-serif-var)", fontStyle: "italic" }}
      >
        {PLACEHOLDER_TEXTS[index]}
      </motion.span>
    </AnimatePresence>
  );
}

// ── Search component ─────────────────────────────────

function SearchSlot({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <div className="relative flex items-center w-full max-w-sm">
      <SearchIcon className="absolute left-4 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={cn(
          "w-full h-11 pl-11 pr-4 text-sm rounded-full border border-border bg-background",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
          "transition-all duration-500 hover:border-primary/20",
          query ? "text-foreground" : "text-transparent caret-foreground"
        )}
      />
      {!query && (
        <div className="absolute left-11 right-4 flex items-center overflow-hidden pointer-events-none">
          <CyclingPlaceholder visible={!query} />
        </div>
      )}
    </div>
  );
}

// ── Filter bar ───────────────────────────────────────

function FilterBar({
  sort,
  setSort,
  countryFilter,
  setCountryFilter,
  countries,
}: {
  sort: string;
  setSort: (s: string) => void;
  countryFilter: string | null;
  setCountryFilter: (c: string | null) => void;
  countries: string[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex items-center gap-4 overflow-x-auto scrollbar-hidden pb-1"
    >
      {/* Country filter pills */}
      <div className="flex items-center gap-2 shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          onClick={() => setCountryFilter(null)}
          className={cn(
            "text-[10px] uppercase tracking-[0.08em] font-medium rounded-full px-3 py-1.5 whitespace-nowrap cursor-pointer transition-all duration-500",
            countryFilter === null
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
              : "text-foreground/60 bg-muted/60 border border-border/50 hover:border-primary/20"
          )}
        >
          All Countries
        </motion.button>
        {countries.map((code, index) => {
          const data = COUNTRY_MAP[code];
          return (
            <motion.button
              key={code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 + 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCountryFilter(countryFilter === code ? null : code)}
              className={cn(
                "text-[10px] uppercase tracking-[0.08em] font-medium rounded-full px-3 py-1.5 whitespace-nowrap cursor-pointer transition-all duration-500 flex items-center gap-1",
                countryFilter === code
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-foreground/60 bg-muted/60 border border-border/50 hover:border-primary/20"
              )}
            >
              {data?.emoji} {data?.name ?? code}
            </motion.button>
          );
        })}
      </div>

      {/* Subtle separator */}
      <div className="h-5 w-px bg-border/50 shrink-0" />

      {/* Sort options */}
      <div className="flex items-center gap-2 shrink-0">
        <SlidersHorizontalIcon className="h-3.5 w-3.5 text-muted-foreground/50" />
        <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60 font-medium">
          Sort:
        </span>
        {SORT_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={() => setSort(option.value)}
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-lg transition-all duration-300 cursor-pointer",
              sort === option.value
                ? "text-foreground bg-foreground/[0.08]"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main client component ─────────────────────────────

export function AllOrgsClient({ organizations }: { organizations: MockOrganization[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("bumicerts");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const { setRightContent } = useHeaderContext();

  // Clear header slots on unmount
  useEffect(() => {
    return () => setRightContent(null);
  }, [setRightContent]);

  const countries = useMemo(
    () => Array.from(new Set(organizations.map((o) => o.country))),
    [organizations]
  );

  const filtered = useMemo(() => {
    let result = [...organizations];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (o) =>
          o.displayName.toLowerCase().includes(q) ||
          o.shortDescription.toLowerCase().includes(q) ||
          o.objectives.some((obj) => obj.toLowerCase().includes(q))
      );
    }
    if (countryFilter) {
      result = result.filter((o) => o.country === countryFilter);
    }
    switch (sort) {
      case "bumicerts":
        result.sort((a, b) => b.bumicertCount - a.bumicertCount);
        break;
      case "alpha":
        result.sort((a, b) => a.displayName.localeCompare(b.displayName));
        break;
      case "newest":
        result.sort((a, b) =>
          (b.startDate ?? "").localeCompare(a.startDate ?? "")
        );
        break;
    }
    return result;
  }, [query, sort, countryFilter, organizations]);

  return (
    <section className="pt-6 pb-20 md:pb-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Compact hero area */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
              <UsersIcon className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Organizations
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[-0.02em] leading-[1.1] text-foreground"
              style={{ fontFamily: "var(--font-garamond-var)" }}
            >
              Nature{" "}
              <span
                className="text-foreground/80"
                style={{ fontFamily: "var(--font-instrument-serif-var)", fontStyle: "italic" }}
              >
                Stewards
              </span>
            </h1>
          </div>

          {/* Result count - editorial flair */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-baseline gap-2"
          >
            <span
              className="text-4xl md:text-5xl font-light text-primary/20"
              style={{ fontFamily: "var(--font-garamond-var)" }}
            >
              {filtered.length}
            </span>
            <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
              {filtered.length === 1 ? "organization" : "organizations"}
            </span>
          </motion.div>
        </motion.div>

        {/* Search + filters inline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-4"
        >
          <SearchSlot query={query} setQuery={setQuery} />
          <FilterBar
            sort={sort}
            setSort={setSort}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            countries={countries}
          />
        </motion.div>

        {/* Gradient separator line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />

        {/* Grid or empty state */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center justify-center py-28 px-6 text-center"
          >
            {/* Large decorative number */}
            <span
              className="text-7xl md:text-8xl font-light text-primary/[0.15] tracking-tight mb-4"
              style={{ fontFamily: "var(--font-garamond-var)" }}
            >
              0
            </span>

            <div className="flex items-center gap-2 mb-3">
              <SearchIcon className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
                No Results
              </span>
            </div>

            <h3
              className="text-2xl md:text-3xl font-light text-foreground mb-3"
              style={{ fontFamily: "var(--font-garamond-var)" }}
            >
              No organizations found
            </h3>

            <p
              className="text-base text-foreground/80 max-w-md leading-relaxed"
              style={{ fontFamily: "var(--font-instrument-serif-var)", fontStyle: "italic" }}
            >
              Try adjusting your search or filters to discover nature steward organizations.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${query}-${sort}-${countryFilter}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 lg:gap-10"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((org) => (
                <OrganizationCard key={org.did} org={org} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
