"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchIcon, SlidersHorizontalIcon, BuildingIcon } from "lucide-react";
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

// ── Header slots ──────────────────────────────────────

function AllOrgsHeaderSlots({
  query,
  setQuery,
  sort,
  setSort,
  countryFilter,
  setCountryFilter,
  countries,
}: {
  query: string;
  setQuery: (q: string) => void;
  sort: string;
  setSort: (s: string) => void;
  countryFilter: string | null;
  setCountryFilter: (c: string | null) => void;
  countries: string[];
}) {
  const { setLeftContent, setSubHeaderContent } = useHeaderContext();

  useEffect(() => {
    setLeftContent(
      <div className="relative flex items-center w-full max-w-xs">
        <SearchIcon className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organizations..."
          className={cn(
            "w-full h-8 pl-9 pr-3 text-sm rounded-full bg-muted/50 border border-border",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background",
            "transition-all duration-200 shadow-inner placeholder:text-muted-foreground/60"
          )}
        />
      </div>
    );
  }, [query, setQuery, setLeftContent]);

  useEffect(() => {
    setSubHeaderContent(
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setCountryFilter(null)}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer",
              countryFilter === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            All countries
          </button>
          {countries.map((code) => {
            const data = COUNTRY_MAP[code];
            return (
              <button
                key={code}
                onClick={() => setCountryFilter(countryFilter === code ? null : code)}
                className={cn(
                  "h-7 px-3 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer flex items-center gap-1",
                  countryFilter === code
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {data?.emoji} {data?.name ?? code}
              </button>
            );
          })}
        </div>
        <div className="h-4 w-px bg-border shrink-0" />
        <div className="flex items-center gap-1 shrink-0">
          <SlidersHorizontalIcon className="h-3 w-3 text-muted-foreground/60" />
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer",
                sort === option.value
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }, [sort, countryFilter, setSort, setCountryFilter, setSubHeaderContent, countries]);

  useEffect(() => {
    return () => {
      setLeftContent(null);
      setSubHeaderContent(null);
    };
  }, [setLeftContent, setSubHeaderContent]);

  return null;
}

// ── Main client component ─────────────────────────────

export function AllOrgsClient({ organizations }: { organizations: MockOrganization[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("bumicerts");
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

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
    <div className="w-full">
      <AllOrgsHeaderSlots
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        countries={countries}
      />

      <div className="p-4">
        <motion.p
          key={filtered.length}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-muted-foreground mb-4"
        >
          {filtered.length} organization{filtered.length !== 1 ? "s" : ""} found
        </motion.p>

        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <BuildingIcon className="h-10 w-10 text-muted-foreground/30" />
            <h3 className="font-serif text-xl font-bold text-muted-foreground">
              No organizations found.
            </h3>
            <p className="text-sm text-muted-foreground">
              Try a different search or clear the filters.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={`${query}-${sort}-${countryFilter}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((org) => (
                <OrganizationCard key={org.did} org={org} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
