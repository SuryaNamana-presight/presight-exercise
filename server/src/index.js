import { app } from "./app.js";
import { config } from "./config.js";
import { initializeDatabase } from "./db/database.js";
import { seedDatabase } from "./db/seed.js";

initializeDatabase();
seedDatabase();
app.listen(config.port, () =>
  console.log(`PeopleSpace API running on http://localhost:${config.port}`),
);
