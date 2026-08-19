import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";

import type { User } from "../model/types";

export function UserCard({ user }: { user: User }) {
  const initials = `${user.first_name[0]}${user.last_name[0]}`;
  const [isHobbyPopoverOpen, setIsHobbyPopoverOpen] = useState(false);
  const hobbyPopoverRef = useRef<HTMLDivElement>(null);
  const hobbyButtonRef = useRef<HTMLButtonElement>(null);
  const hobbyPopoverId = useId();

  useEffect(() => {
    if (!isHobbyPopoverOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      if (!hobbyPopoverRef.current?.contains(event.target as Node)) {
        setIsHobbyPopoverOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsHobbyPopoverOpen(false);
        hobbyButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isHobbyPopoverOpen]);

  return (
    <article className="user-card">
      <div className="avatar-wrap">
        <span className="avatar-fallback">{initials}</span>
        <img
          className="avatar"
          src={user.avatar}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
        <span className="online-dot" aria-label="Available" />
      </div>
      <div className="user-card__body">
        <h2>
          {user.first_name} {user.last_name}
        </h2>
        <div className="user-meta">
          <span>
            <MapPin size={14} />
            {user.nationality}
          </span>
          <span className="meta-divider" />
          <span>{user.age} years</span>
        </div>
        <div className="hobby-row">
          {user.hobbies.length ? (
            <>
              {user.hobbies.slice(0, 2).map((hobby) => (
                <span className="hobby-chip" key={hobby}>
                  {hobby}
                </span>
              ))}
              {user.hobbies.length > 2 && (
                <div
                  ref={hobbyPopoverRef}
                  className={`hobby-more-wrap ${isHobbyPopoverOpen ? "hobby-more-wrap--open" : ""}`}
                >
                  <button
                    ref={hobbyButtonRef}
                    type="button"
                    className="hobby-more"
                    aria-expanded={isHobbyPopoverOpen}
                    aria-controls={hobbyPopoverId}
                    aria-label={`Show ${user.hobbies.length - 2} more hobbies for ${user.first_name}`}
                    onClick={() => setIsHobbyPopoverOpen((current) => !current)}
                  >
                    +{user.hobbies.length - 2}
                  </button>
                  <div
                    id={hobbyPopoverId}
                    className="hobby-popover"
                    role="dialog"
                    aria-label={`Additional hobbies for ${user.first_name} ${user.last_name}`}
                    aria-hidden={!isHobbyPopoverOpen}
                  >
                    <strong>More interests</strong>
                    <div>
                      {user.hobbies.slice(2).map((hobby) => (
                        <span key={hobby}>{hobby}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <span className="no-hobbies">Open to new interests</span>
          )}
        </div>
      </div>
    </article>
  );
}
