import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { User } from "@/entities/user/model/types";
import { UserCard } from "@/entities/user/ui/user-card";

type Props = { users: User[] };

export function DirectoryList({ users }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 132,
    overscan: 7,
  });

  const virtualItems = virtualizer.getVirtualItems();
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
    </div>
  );
}
