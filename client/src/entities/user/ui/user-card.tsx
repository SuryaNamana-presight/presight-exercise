import { MapPin } from "lucide-react";
import type { User } from "../model/types";
export function UserCard({ user }: { user: User }) {
  const initials = `${user.first_name[0]}${user.last_name[0]}`;
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
                <span
                  className="hobby-more"
                  title={user.hobbies.slice(2).join(", ")}
                >
                  +{user.hobbies.length - 2}
                </span>
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
