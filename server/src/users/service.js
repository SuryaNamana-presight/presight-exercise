import { db } from "../db/database.js";
import { AGE_RANGES, buildFilteredUsers } from "./query.js";

export function getUsers(filters) {
  const filtered = buildFilteredUsers(filters);
  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM (${filtered.sql})`)
    .get(...filtered.params).count;
  const rows = db
    .prepare(
      `
    SELECT f.*, COALESCE(GROUP_CONCAT(h.name, '|||'), '') AS hobby_list
    FROM (${filtered.sql}) f
    LEFT JOIN user_hobbies uh ON uh.user_id = f.id
    LEFT JOIN hobbies h ON h.id = uh.hobby_id
    GROUP BY f.id
    ORDER BY f.${filters.sortBy} ${filters.sortDirection}, f.id ${filters.sortDirection}
    LIMIT ? OFFSET ?
  `,
    )
    .all(...filtered.params, filters.limit, filters.offset);
  const users = rows.map(({ hobby_list: hobbyList, ...user }) => ({
    ...user,
    hobbies: hobbyList ? hobbyList.split("|||") : [],
  }));
  const totalPages = Math.ceil(total / filters.limit);
  return {
    data: users,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages,
      hasMore: filters.page < totalPages,
    },
  };
}

export function getFacets(filters) {
  // Self-excluding facets keep selected alternatives discoverable while all other filters remain active.
  const hobbyBase = buildFilteredUsers(filters, "hobby");
  const nationalityBase = buildFilteredUsers(filters, "nationality");
  const ageBase = buildFilteredUsers(filters, "ageRange");
  const hobbies = db
    .prepare(
      `SELECT h.name AS value, COUNT(DISTINCT f.id) AS count FROM (${hobbyBase.sql}) f JOIN user_hobbies uh ON uh.user_id = f.id JOIN hobbies h ON h.id = uh.hobby_id GROUP BY h.id ORDER BY count DESC, value ASC LIMIT 20`,
    )
    .all(...hobbyBase.params);
  const nationalities = db
    .prepare(
      `SELECT f.nationality AS value, COUNT(*) AS count FROM (${nationalityBase.sql}) f GROUP BY f.nationality ORDER BY count DESC, value ASC LIMIT 20`,
    )
    .all(...nationalityBase.params);
  const ageRanges = AGE_RANGES.map((range) => ({
    value: range.value,
    count: db
      .prepare(
        `SELECT COUNT(*) AS count FROM (${ageBase.sql}) f WHERE f.age BETWEEN ? AND ?`,
      )
      .get(...ageBase.params, range.min, range.max).count,
  }));
  return { hobbies, nationalities, ageRanges };
}
