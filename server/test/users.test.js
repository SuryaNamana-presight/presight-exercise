import assert from "node:assert/strict";
import test from "node:test";
import { initializeDatabase } from "../src/db/database.js";
import { seedDatabase } from "../src/db/seed.js";
import { parseUserQuery } from "../src/users/query.js";
import { getFacets, getUsers } from "../src/users/service.js";
import {
  authenticate,
  createSession,
  destroySession,
  getSessionAccount,
} from "../src/auth/service.js";

initializeDatabase();
seedDatabase();

test("returns deterministic pages without duplicate ids", () => {
  const first = getUsers(
    parseUserQuery({
      sortBy: "age",
      sortDirection: "asc",
      page: "1",
      limit: "30",
    }),
  );
  const second = getUsers(
    parseUserQuery({
      sortBy: "age",
      sortDirection: "asc",
      page: "2",
      limit: "30",
    }),
  );
  const ids = [...first.data, ...second.data].map((user) => user.id);
  assert.equal(ids.length, new Set(ids).size);
  assert.equal(first.pagination.hasMore, true);
});

test("multiple hobbies use match-all semantics", () => {
  const result = getUsers(
    parseUserQuery({ hobby: ["Archery", "Camping"], limit: "50" }),
  );
  assert.ok(result.pagination.total > 0);
  result.data.forEach((user) => {
    assert.ok(user.hobbies.includes("Archery"));
    assert.ok(user.hobbies.includes("Camping"));
  });
});

test("multiple nationalities use match-any semantics", () => {
  const result = getUsers(
    parseUserQuery({ nationality: ["Japanese", "Spanish"], limit: "50" }),
  );
  assert.ok(result.pagination.total > 0);
  result.data.forEach((user) =>
    assert.ok(["Japanese", "Spanish"].includes(user.nationality)),
  );
});

test("text and selected filters affect facet counts", () => {
  const unfiltered = getFacets(parseUserQuery({}));
  const filtered = getFacets(
    parseUserQuery({ search: "Aisha", nationality: "Indian" }),
  );
  assert.notDeepEqual(filtered.hobbies, unfiltered.hobbies);
  assert.ok(filtered.hobbies.every((facet) => facet.count >= 0));
});

test("authentication accepts the demo account and rejects a wrong password", () => {
  assert.equal(authenticate("demo@peoplespace.com", "wrong-password"), null);
  const account = authenticate("DEMO@peoplespace.com", "PeopleSpace@123");
  assert.equal(account?.email, "demo@peoplespace.com");
});

test("logout invalidates a persisted session", () => {
  const account = authenticate("demo@peoplespace.com", "PeopleSpace@123");
  assert.ok(account);
  const session = createSession(account.id);
  assert.equal(getSessionAccount(session.token)?.id, account.id);
  destroySession(session.token);
  assert.equal(getSessionAccount(session.token), null);
});
