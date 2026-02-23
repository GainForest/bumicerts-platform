"use client";

import { useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CompassIcon } from "lucide-react";
import { MOCK_BUMICERTS } from "@/lib/mock-data";
import { BumicertGrid } from "./_components/BumicertGrid";
import { ExploreHeaderSlots, type Filters } from "./_components/ExploreHeader";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [filters, setFilters] = useState<Filters>({
    organizations: [],
    countries: [],
    objectives: [],
  });

  // Toggle a filter value (add if not present, remove if present)
  const toggleFilter = useCallback((category: keyof Filters, value: string) => {
    setFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  }, []);

  // Clear all filters in a category
  const clearCategory = useCallback((category: keyof Filters) => {
    setFilters((prev) => ({ ...prev, [category]: [] }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setFilters({ organizations: [], countries: [], objectives: [] });
  }, []);

  const filtered = useMemo(() => {
    let result = [...MOCK_BUMICERTS];

    // Filter by organizations (OR within category)
    if (filters.organizations.length > 0) {
      result = result.filter((b) => filters.organizations.includes(b.organizationDid));
    }

    // Filter by countries (OR within category)
    if (filters.countries.length > 0) {
      result = result.filter((b) => filters.countries.includes(b.country));
    }

    // Filter by objectives (OR within category - has any of the selected)
    if (filters.objectives.length > 0) {
      result = result.filter((b) =>
        b.objectives.some((obj) => filters.objectives.includes(obj))
      );
    }

    // Filter by search query
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.organizationName.toLowerCase().includes(q) ||
          b.country.toLowerCase().includes(q) ||
          b.objectives.some((o) => o.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "newest") return b.createdAt.getTime() - a.createdAt.getTime();
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return result;
  }, [query, sort, filters]);

  // Count active filters
  const activeFilterCount = filters.organizations.length + filters.countries.length + filters.objectives.length;

  return (
    <section className="pt-6 pb-20 md:pb-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Compact hero area - content visible immediately */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
        >
          <div>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
              <CompassIcon className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
                Explore Projects
              </span>
            </div>
            
            {/* Headline - more compact */}
            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-light tracking-[-0.02em] leading-[1.1] text-foreground"
              style={{ fontFamily: "var(--font-garamond-var)" }}
            >
              Discover{" "}
              <span 
                className="text-foreground/80"
                style={{ fontFamily: "var(--font-instrument-serif-var)", fontStyle: "italic" }}
              >
                Regenerative Impact
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
              {filtered.length === 1 ? "project" : "projects"}
            </span>
          </motion.div>
        </motion.div>

        {/* Search/filters */}
        <ExploreHeaderSlots
          query={query}
          setQuery={setQuery}
          sort={sort}
          setSort={setSort}
          filters={filters}
          setFilters={setFilters}
          toggleFilter={toggleFilter}
          activeFilterCount={activeFilterCount}
        />

        {/* Gradient separator line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent my-8" />

        {/* Grid - generous spacing maintained here */}
        <BumicertGrid bumicerts={filtered} />
      </div>
    </section>
  );
}
