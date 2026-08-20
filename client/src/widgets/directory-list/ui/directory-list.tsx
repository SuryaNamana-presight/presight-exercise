import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { User } from "@/entities/user/model/types";
import { UserCard } from "@/entities/user/ui/user-card";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";

type Props = {
  users: User[];
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: boolean;
  onLoadMore: () => void;
};

export function DirectoryList({
  users,
  hasMore,
  isLoadingMore,
  loadMoreError,
  onLoadMore,
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 132,
    overscan: 7,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const lastVisibleIndex = virtualItems.at(-1)?.index;

  useEffect(() => {
    if (
      lastVisibleIndex !== undefined &&
      lastVisibleIndex >= users.length - 6 &&
      hasMore &&
      !isLoadingMore &&
      !loadMoreError
    ) {
      onLoadMore();
    }
  }, [
    hasMore,
    isLoadingMore,
    lastVisibleIndex,
    loadMoreError,
    onLoadMore,
    users.length,
  ]);

  return (
    <div
      ref={parentRef}
      className="directory-scroll"
      aria-label="People results"
    >
      <div
        className="virtual-space"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualItems.map((row) => {
          const user = users[row.index];
          return (
            <div
              key={user.id}
              ref={virtualizer.measureElement}
              data-index={row.index}
              className="virtual-row"
              style={{ transform: `translateY(${row.start}px)` }}
            >
              <UserCard user={user} />
            </div>
          );
        })}
      </div>
      {isLoadingMore && (
        <div className="load-more">
          <Spinner label="Loading more people…" />
        </div>
      )}
      {loadMoreError && (
        <div className="load-more-error">
          <span>Couldn’t load more people.</span>
          <Button onClick={onLoadMore}>Try again</Button>
        </div>
      )}
      {!hasMore && users.length > 0 && (
        <div className="end-list">
          <span />
          All {users.length} people loaded
          <span />
        </div>
      )}
    </div>
  );
}
