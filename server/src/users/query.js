const SORT_FIELDS = new Set(["first_name", "last_name", "age", "nationality"]);
export const AGE_RANGES = [
  { value: "10-20", min: 10, max: 20 },
  { value: "21-30", min: 21, max: 30 },
  { value: "31-40", min: 31, max: 40 },
  { value: "41-50", min: 41, max: 50 },
  { value: "51-60", min: 51, max: 60 },
  { value: "61-70", min: 61, max: 70 },
  { value: "71-80", min: 71, max: 80 },
];
const AGE_RANGE_VALUES = new Set(AGE_RANGES.map((range) => range.value));

const splitValues = (value) => {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [
    ...new Set(
      values
        .flatMap((item) => String(item).split(","))
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
};

export function parseUserQuery(query) {
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit, 10) || 30),
  );
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  return {
    search: String(query.search || "")
      .trim()
      .slice(0, 100),
    nationalities: splitValues(query.nationality),
    hobbies: splitValues(query.hobby),
    ageRanges: splitValues(query.ageRange).filter((range) =>
      AGE_RANGE_VALUES.has(range),
    ),
    sortBy: SORT_FIELDS.has(query.sortBy) ? query.sortBy : "first_name",
    sortDirection: query.sortDirection === "desc" ? "DESC" : "ASC",
    limit,
    page,
    offset: (page - 1) * limit,
  };
}

function placeholders(items) {
  return items.map(() => "?").join(",");
}

export function buildFilteredUsers(
  { search, nationalities, hobbies, ageRanges },
  exclude = null,
) {
  const clauses = ["1 = 1"];
  const params = [];
  if (search) {
    clauses.push(
      "(LOWER(u.first_name) LIKE ? ESCAPE '\\' OR LOWER(u.last_name) LIKE ? ESCAPE '\\' OR LOWER(u.first_name || ' ' || u.last_name) LIKE ? ESCAPE '\\')",
    );
    const escaped = search.toLowerCase().replace(/[\\%_]/g, "\\$&");
    params.push(`%${escaped}%`, `%${escaped}%`, `%${escaped}%`);
  }
  if (nationalities.length && exclude !== "nationality") {
    clauses.push(`u.nationality IN (${placeholders(nationalities)})`);
    params.push(...nationalities);
  }
  if (hobbies.length && exclude !== "hobby") {
    clauses.push(
      `u.id IN (SELECT uh.user_id FROM user_hobbies uh JOIN hobbies selected ON selected.id = uh.hobby_id WHERE selected.name IN (${placeholders(hobbies)}) GROUP BY uh.user_id HAVING COUNT(DISTINCT selected.name) = ?)`,
    );
    params.push(...hobbies, hobbies.length);
  }
  if (ageRanges.length && exclude !== "ageRange") {
    const selectedRanges = ageRanges.map((value) =>
      AGE_RANGES.find((range) => range.value === value),
    );
    clauses.push(
      `(${selectedRanges.map(() => "u.age BETWEEN ? AND ?").join(" OR ")})`,
    );
    selectedRanges.forEach((range) => params.push(range.min, range.max));
  }
  return {
    sql: `SELECT u.* FROM users u WHERE ${clauses.join(" AND ")}`,
    params,
  };
}
