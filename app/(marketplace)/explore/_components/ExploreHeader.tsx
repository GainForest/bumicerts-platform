"use client";

import { useEffect, useState } from "react";
import { SearchIcon, SlidersHorizontalIcon, PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useHeaderContext } from "../../_components/Header/context";
import { MOCK_BUMICERTS } from "@/lib/mock-data";

const PLACEHOLDER_TEXTS = [
  "Search by location...",
  "Search by ecosystem type...",
  "Search by organization...",
  "Search by impact area...",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

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
      >
        {PLACEHOLDER_TEXTS[index]}
      </motion.span>
    </AnimatePresence>
  );
}

export function ExploreHeaderSlots({
  query,
  setQuery,
  sort,
  setSort,
  orgFilter,
  setOrgFilter,
}: {
  query: string;
  setQuery: (q: string) => void;
  sort: string;
  setSort: (s: string) => void;
  orgFilter: string | null;
  setOrgFilter: (o: string | null) => void;
}) {
  const { setLeftContent, setRightContent, setSubHeaderContent } =
    useHeaderContext();

  const orgs = Array.from(
    new Map(
      MOCK_BUMICERTS.map((b) => [b.organizationDid, b.organizationName])
    ).entries()
  );

  // Left slot: search input
  useEffect(() => {
    setLeftContent(
      <SearchSlot query={query} setQuery={setQuery} />
    );
  }, [query, setQuery, setLeftContent]);

  // Right slot: create button (static)
  useEffect(() => {
    setRightContent(
      <Link
        href="/bumicert/create"
        className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <PlusIcon className="h-3.5 w-3.5" />
        Create
      </Link>
    );
    return () => setRightContent(null);
  }, [setRightContent]);

  // Sub-header slot: filters + sort
  useEffect(() => {
    setSubHeaderContent(
      <FilterBar
        orgs={orgs}
        sort={sort}
        setSort={setSort}
        orgFilter={orgFilter}
        setOrgFilter={setOrgFilter}
      />
    );
  }, [sort, orgFilter, setSort, setOrgFilter, setSubHeaderContent, orgs]);

  // Cleanup
  useEffect(() => {
    return () => {
      setLeftContent(null);
      setRightContent(null);
      setSubHeaderContent(null);
    };
  }, [setLeftContent, setRightContent, setSubHeaderContent]);

  return null;
}

function SearchSlot({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (q: string) => void;
}) {
  return (
    <div className="relative flex items-center w-full max-w-xs">
      <SearchIcon className="absolute left-3 h-3.5 w-3.5 text-muted-foreground/60 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={cn(
          "w-full h-8 pl-9 pr-3 text-sm rounded-full bg-muted/50 border border-border",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background",
          "transition-all duration-200 shadow-inner",
          query ? "text-foreground" : "text-transparent caret-foreground"
        )}
      />
      {!query && (
        <div className="absolute left-9 right-3 flex items-center overflow-hidden pointer-events-none">
          <CyclingPlaceholder visible={!query} />
        </div>
      )}
    </div>
  );
}

function FilterBar({
  orgs,
  sort,
  setSort,
  orgFilter,
  setOrgFilter,
}: {
  orgs: [string, string][];
  sort: string;
  setSort: (s: string) => void;
  orgFilter: string | null;
  setOrgFilter: (o: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hidden pb-1">
      <div className="flex items-center gap-1.5 shrink-0">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => setOrgFilter(null)}
          className={cn(
            "h-7 px-3 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer",
            orgFilter === null
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </motion.button>
        {orgs.map(([did, name]) => (
          <motion.button
            key={did}
            whileTap={{ scale: 0.93 }}
            onClick={() => setOrgFilter(orgFilter === did ? null : did)}
            className={cn(
              "h-7 px-3 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap cursor-pointer",
              orgFilter === did
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {name}
          </motion.button>
        ))}
      </div>
      <div className="h-4 w-px bg-border shrink-0" />
      <div className="flex items-center gap-1 shrink-0">
        <SlidersHorizontalIcon className="h-3 w-3 text-muted-foreground/60" />
        {SORT_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            whileTap={{ scale: 0.93 }}
            onClick={() => setSort(option.value)}
            className={cn(
              "h-7 px-2.5 rounded-lg text-xs font-medium transition-colors duration-150 cursor-pointer",
              sort === option.value
                ? "bg-foreground/10 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
