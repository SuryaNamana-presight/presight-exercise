import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 4000),
  databasePath:
    process.env.DATABASE_PATH ||
    path.resolve(directory, "../data/directory.db"),
  clientPath: path.resolve(directory, "../../client/dist"),
};
