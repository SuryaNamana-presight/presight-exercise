import { pathToFileURL } from "node:url";
import { randomBytes, scryptSync } from "node:crypto";
import { db, initializeDatabase } from "./database.js";
import { firstNames, hobbies, lastNames, nationalities } from "./seed-data.js";

export function seedDatabase(count = 2400) {
  initializeDatabase();
  seedDemoAccount();
  const current = db.prepare("SELECT COUNT(*) AS count FROM users").get().count;
  if (current >= count) return current;

  const seed = db.transaction(() => {
    db.exec(
      "DELETE FROM user_hobbies; DELETE FROM hobbies; DELETE FROM users;",
    );
    const addHobby = db.prepare("INSERT INTO hobbies(name) VALUES (?)");
    hobbies.forEach((hobby) => addHobby.run(hobby));
    const hobbyRows = db
      .prepare("SELECT id, name FROM hobbies ORDER BY id")
      .all();
    const addUser = db.prepare(
      "INSERT INTO users(id, avatar, first_name, last_name, age, nationality) VALUES (?, ?, ?, ?, ?, ?)",
    );
    const addUserHobby = db.prepare(
      "INSERT INTO user_hobbies(user_id, hobby_id) VALUES (?, ?)",
    );

    for (let id = 1; id <= count; id += 1) {
      const firstName =
        firstNames[(id * 17 + Math.floor(id / 7)) % firstNames.length];
      const lastName =
        lastNames[(id * 11 + Math.floor(id / 13)) % lastNames.length];
      const nationality =
        nationalities[(id * 7 + Math.floor(id / 5)) % nationalities.length];
      const age = 18 + ((id * 13) % 55);
      addUser.run(
        id,
        `https://i.pravatar.cc/160?img=${(id % 70) + 1}`,
        firstName,
        lastName,
        age,
        nationality,
      );
      const hobbyCount = (id * 7) % 11;
      for (let index = 0; index < hobbyCount; index += 1) {
        const hobby = hobbyRows[(id * 5 + index * 11) % hobbyRows.length];
        addUserHobby.run(id, hobby.id);
      }
    }
  });
  seed();
  return count;
}

function seedDemoAccount() {
  const existing = db
    .prepare("SELECT id FROM accounts WHERE email = ?")
    .get("demo@peoplespace.com");
  if (existing) return;
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync("PeopleSpace@123", salt, 64).toString("hex");
  db.prepare(
    "INSERT INTO accounts(email, display_name, password_hash) VALUES (?, ?, ?)",
  ).run("demo@peoplespace.com", "Surya Namana", `${salt}:${hash}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const count = seedDatabase(Number(process.env.SEED_COUNT || 2400));
  console.log(`Database ready with ${count} users.`);
  db.close();
}
