const SORT_FIELDS = new Set(["first_name", "last_name", "age", "nationality"]);

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
  { search, nationalities, hobbies },
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
  return {
    sql: `SELECT u.* FROM users u WHERE ${clauses.join(" AND ")}`,
    params,
  };
}
