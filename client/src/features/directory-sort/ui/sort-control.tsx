import { ArrowDownAZ, ArrowDownZA } from "lucide-react";
import type { DirectoryFilters, SortField } from "@/entities/user/model/types";
type Props = {
  sortBy: SortField;
  direction: DirectoryFilters["sortDirection"];
  onChange: (patch: Partial<DirectoryFilters>) => void;
};
export function SortControl({ sortBy, direction, onChange }: Props) {
  return (
    <div className="sort-control">
      <span>Sort by</span>
      <select
        aria-label="Sort directory"
        value={sortBy}
        onChange={(e) => onChange({ sortBy: e.target.value as SortField })}
      >
        <option value="first_name">First name</option>
        <option value="last_name">Last name</option>
        <option value="age">Age</option>
        <option value="nationality">Nationality</option>
      </select>
      <button
        className="sort-direction"
        aria-label={`Sort ${direction === "asc" ? "descending" : "ascending"}`}
        onClick={() =>
          onChange({ sortDirection: direction === "asc" ? "desc" : "asc" })
        }
      >
        {direction === "asc" ? (
          <ArrowDownAZ size={19} />
        ) : (
          <ArrowDownZA size={19} />
        )}
      </button>
    </div>
  );
}
