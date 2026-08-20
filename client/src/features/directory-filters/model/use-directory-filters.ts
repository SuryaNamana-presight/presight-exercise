import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { DirectoryFilters, SortField } from "@/entities/user/model/types";

const validSort = new Set(["first_name", "last_name", "age", "nationality"]);

export function useDirectoryFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo<DirectoryFilters>(() => {
    const sort = params.get("sortBy");
    return {
      search: params.get("search") || "",
      hobbies: params.getAll("hobby"),
      nationalities: params.getAll("nationality"),
      ageRanges: params.getAll("ageRange"),
      sortBy: validSort.has(sort || "") ? (sort as SortField) : "first_name",
      sortDirection: params.get("sortDirection") === "desc" ? "desc" : "asc",
    };
  }, [params]);

  const update = useCallback(
    (patch: Partial<DirectoryFilters>) => {
      const next = { ...filters, ...patch };
      const query = new URLSearchParams();
      if (next.search) query.set("search", next.search);
      next.hobbies.forEach((v) => query.append("hobby", v));
      next.nationalities.forEach((v) => query.append("nationality", v));
      next.ageRanges.forEach((v) => query.append("ageRange", v));
      if (next.sortBy !== "first_name") query.set("sortBy", next.sortBy);
      if (next.sortDirection !== "asc")
        query.set("sortDirection", next.sortDirection);
      setParams(query, { replace: true });
    },
    [filters, setParams],
  );

  const toggle = useCallback(
    (type: "hobbies" | "nationalities" | "ageRanges", value: string) => {
      const current = filters[type];
      update({
        [type]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      });
    },
    [filters, update],
  );

  const clear = useCallback(
    () => update({ search: "", hobbies: [], nationalities: [], ageRanges: [] }),
    [update],
  );

  return {
    filters,
    update,
    toggle,
    clear,
    activeCount:
      filters.hobbies.length +
      filters.nationalities.length +
      filters.ageRanges.length,
  };
}
