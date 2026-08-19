import { useId, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import type { Facet } from "@/entities/user/model/types";
import { Button } from "@/shared/ui/button";

type Props = {
  hobbies: Facet[];
  nationalities: Facet[];
  ageRanges: Facet[];
  selectedHobbies: string[];
  selectedNationalities: string[];
  selectedAgeRanges: string[];
  loading: boolean;
  onToggleHobby: (v: string) => void;
  onToggleNationality: (v: string) => void;
  onToggleAgeRange: (v: string) => void;
  onClear: () => void;
  mobileOpen: boolean;
  onClose: () => void;
};
function FacetGroup({
  title,
  items,
  selected,
  onToggle,
  searchable = true,
}: {
  title: string;
  items: Facet[];
  selected: string[];
  onToggle: (v: string) => void;
  searchable?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const optionsId = useId();
  const searchId = useId();
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const filteredItems = normalizedSearch
    ? items.filter((item) =>
        item.value.toLocaleLowerCase().includes(normalizedSearch),
      )
    : items;

  return (
    <section className="facet-group">
      <h3>
        <button
          type="button"
          className="facet-group__trigger"
          aria-expanded={isExpanded}
          aria-controls={optionsId}
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>{title}</span>
          <ChevronDown
            className={
              isExpanded ? "facet-chevron facet-chevron--open" : "facet-chevron"
            }
            size={16}
          />
        </button>
      </h3>
      <div id={optionsId} hidden={!isExpanded}>
        {searchable && (
          <label className="facet-search" htmlFor={searchId}>
            <Search size={14} aria-hidden="true" />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={`Search ${title.toLocaleLowerCase()}`}
              aria-label={`Search ${title.toLocaleLowerCase()}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={`Clear ${title.toLocaleLowerCase()} search`}
              >
                <X size={13} />
              </button>
            )}
          </label>
        )}
        <div className="facet-options">
          {filteredItems.map((item) => (
            <label className="facet-option" key={item.value}>
              <input
                type="checkbox"
                checked={selected.includes(item.value)}
                onChange={() => onToggle(item.value)}
              />
              <span className="custom-check" />
              <span className="facet-name">{item.value}</span>
              <span className="facet-count">{item.count}</span>
            </label>
          ))}
          {filteredItems.length === 0 && (
            <p className="facet-empty">No matching options</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function FilterPanel(props: Props) {
  const count =
    props.selectedHobbies.length +
    props.selectedNationalities.length +
    props.selectedAgeRanges.length;
  return (
    <aside
      className={`filters-panel ${props.mobileOpen ? "filters-panel--open" : ""}`}
      aria-label="Directory filters"
    >
      <div className="filter-header">
        <div>
          <SlidersHorizontal size={18} />
          <h2>Filters</h2>
          {count > 0 && <span className="filter-badge">{count}</span>}
        </div>
        <button
          className="icon-button mobile-only"
          onClick={props.onClose}
          aria-label="Close filters"
        >
          <X size={20} />
        </button>
      </div>
      {count > 0 && (
        <Button
          variant="ghost"
          className="clear-filters"
          onClick={props.onClear}
        >
          Clear all
        </Button>
      )}
      <div className={props.loading ? "facets-loading" : ""}>
        <FacetGroup
          title="Age"
          items={props.ageRanges}
          selected={props.selectedAgeRanges}
          onToggle={props.onToggleAgeRange}
          searchable={false}
        />
        <FacetGroup
          title="Nationality"
          items={props.nationalities}
          selected={props.selectedNationalities}
          onToggle={props.onToggleNationality}
        />
        <FacetGroup
          title="Hobbies & interests"
          items={props.hobbies}
          selected={props.selectedHobbies}
          onToggle={props.onToggleHobby}
        />
      </div>
    </aside>
  );
}
