import { useEffect, useMemo, useState } from "react";
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { LogOut, Search, SlidersHorizontal, UsersRound, X } from "lucide-react";
import { fetchFacets, fetchUsers } from "@/entities/user/api/user-api";
import { useDirectoryFilters } from "@/features/directory-filters/model/use-directory-filters";
import { FilterPanel } from "@/features/directory-filters/ui/filter-panel";
import { SortControl } from "@/features/directory-sort/ui/sort-control";
import { useDebouncedValue } from "@/shared/lib/use-debounced-value";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { DirectoryList } from "@/widgets/directory-list/ui/directory-list";
import { useAuth } from "@/features/auth/model/auth-context";

export function DirectoryPage() {
  const { account, logout } = useAuth();
  const { filters, update, toggle, clear, activeCount } = useDirectoryFilters();
  const [search, setSearch] = useState(filters.search);
  const [mobileFilters, setMobileFilters] = useState(false);
  const debouncedSearch = useDebouncedValue(search);
  useEffect(() => setSearch(filters.search), [filters.search]);
  useEffect(() => {
    if (debouncedSearch !== filters.search) update({ search: debouncedSearch });
  }, [debouncedSearch, filters.search, update]);
  const requestFilters = useMemo(
    () => ({ ...filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );
  const usersQuery = useInfiniteQuery({
    queryKey: ["users", requestFilters],
    queryFn: ({ pageParam, signal }) =>
      fetchUsers(requestFilters, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
  });
  const facetsQuery = useQuery({
    queryKey: [
      "facets",
      requestFilters.search,
      requestFilters.hobbies,
      requestFilters.nationalities,
      requestFilters.ageRanges,
    ],
    queryFn: ({ signal }) => fetchFacets(requestFilters, signal),
    placeholderData: keepPreviousData,
  });
  const users = usersQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = usersQuery.data?.pages[0]?.pagination.total ?? 0;
  const isInitialLoading = usersQuery.isLoading && !users.length;
  const error = facetsQuery.error || (!users.length ? usersQuery.error : null);
  const initials =
    account?.displayName
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "PS";
  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="PeopleSpace home">
          <span className="brand-mark">
            <UsersRound size={21} />
          </span>
          <span>
            People<span>Space</span>
          </span>
        </a>
        <div className="topbar-copy">A world of people, one place.</div>
        <div className="account-summary">
          <div>
            <strong>{account?.displayName}</strong>
            <span>{account?.email}</span>
          </div>
          <div className="profile">
            <span>{initials}</span>
          </div>
          <button
            className="logout-button"
            onClick={() => void logout()}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="page">
        <section className="hero">
          <div>
            <p className="eyebrow">GLOBAL DIRECTORY</p>
            <h1>Find your people.</h1>
            <p>
              Explore a community of curious minds, creators and collaborators
              from around the world.
            </p>
          </div>
          <div className="community-stat">
            <div className="avatar-stack">
              <span>AM</span>
              <span>JK</span>
              <span>RL</span>
            </div>
            <div>
              <strong>{total.toLocaleString()}+</strong>
              <span>people to discover</span>
            </div>
          </div>
        </section>
        <section className="toolbar">
          <label className="search-box">
            <Search size={20} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name…"
              aria-label="Search people by name"
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={17} />
              </button>
            )}
          </label>
          <Button
            className="filter-mobile-button"
            onClick={() => setMobileFilters(true)}
          >
            <SlidersHorizontal size={17} />
            Filters{activeCount > 0 && <span>{activeCount}</span>}
          </Button>
          <SortControl
            sortBy={filters.sortBy}
            direction={filters.sortDirection}
            onChange={update}
          />
        </section>
        {activeCount > 0 && (
          <div className="active-filters">
            {filters.ageRanges.map((value) => (
              <button key={value} onClick={() => toggle("ageRanges", value)}>
                Age {value}
                <X size={13} />
              </button>
            ))}
            {filters.nationalities.map((v) => (
              <button key={v} onClick={() => toggle("nationalities", v)}>
                {v}
                <X size={13} />
              </button>
            ))}
            {filters.hobbies.map((v) => (
              <button key={v} onClick={() => toggle("hobbies", v)}>
                {v}
                <X size={13} />
              </button>
            ))}
          </div>
        )}
        <div className="content-grid">
          <FilterPanel
            ageRanges={facetsQuery.data?.ageRanges ?? []}
            hobbies={facetsQuery.data?.hobbies ?? []}
            nationalities={facetsQuery.data?.nationalities ?? []}
            selectedHobbies={filters.hobbies}
            selectedNationalities={filters.nationalities}
            selectedAgeRanges={filters.ageRanges}
            loading={facetsQuery.isFetching}
            onToggleHobby={(v) => toggle("hobbies", v)}
            onToggleNationality={(v) => toggle("nationalities", v)}
            onToggleAgeRange={(v) => toggle("ageRanges", v)}
            onClear={clear}
            mobileOpen={mobileFilters}
            onClose={() => setMobileFilters(false)}
          />
          <section className="results">
            <div className="results-heading">
              <div>
                <h2>People</h2>
                <span>
                  {total.toLocaleString()} {total === 1 ? "person" : "people"}
                </span>
              </div>
              {usersQuery.isFetching &&
                !usersQuery.isFetchingNextPage &&
                !isInitialLoading && <Spinner label="Updating" />}
            </div>
            {error ? (
              <div className="state-card state-card--error">
                <span>!</span>
                <h3>We couldn’t load the directory</h3>
                <p>{error.message}</p>
                <Button
                  variant="primary"
                  onClick={() => {
                    void usersQuery.refetch();
                    void facetsQuery.refetch();
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : isInitialLoading ? (
              <div className="skeleton-list">
                {[1, 2, 3, 4].map((i) => (
                  <div className="skeleton-card" key={i}>
                    <i />
                    <div>
                      <b />
                      <span />
                      <em />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="state-card">
                <span>
                  <Search size={24} />
                </span>
                <h3>No people found</h3>
                <p>
                  Try a different name or remove some filters to broaden your
                  search.
                </p>
                <Button onClick={clear}>Clear filters</Button>
              </div>
            ) : (
              <DirectoryList
                users={users}
                hasMore={Boolean(usersQuery.hasNextPage)}
                isLoadingMore={usersQuery.isFetchingNextPage}
                loadMoreError={usersQuery.isFetchNextPageError}
                onLoadMore={() => void usersQuery.fetchNextPage()}
              />
            )}
          </section>
        </div>
      </main>
      {mobileFilters && (
        <button
          className="drawer-backdrop"
          aria-label="Close filters"
          onClick={() => setMobileFilters(false)}
        />
      )}
    </div>
  );
}
