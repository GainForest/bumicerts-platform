"use client";

import { useMemo, useState } from "react";
import { MOCK_BUMICERTS } from "@/lib/mock-data";
import { BumicertGrid } from "./_components/BumicertGrid";
import { ExploreHeaderSlots } from "./_components/ExploreHeader";

export default function ExplorePage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [orgFilter, setOrgFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...MOCK_BUMICERTS];

    // Filter by org
    if (orgFilter) {
      result = result.filter((b) => b.organizationDid === orgFilter);
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
  }, [query, sort, orgFilter]);

  return (
    <div className="w-full">
      <ExploreHeaderSlots
        query={query}
        setQuery={setQuery}
        sort={sort}
        setSort={setSort}
        orgFilter={orgFilter}
        setOrgFilter={setOrgFilter}
      />
      <BumicertGrid bumicerts={filtered} />
    </div>
  );
}
