import { Router } from "express";
import { parseUserQuery } from "./query.js";
import { getFacets, getUsers } from "./service.js";

export const usersRouter = Router();
usersRouter.get("/", (request, response, next) => {
  try {
    response.json(getUsers(parseUserQuery(request.query)));
  } catch (error) {
    next(error);
  }
});
usersRouter.get("/facets", (request, response, next) => {
  try {
    response.json(getFacets(parseUserQuery(request.query)));
  } catch (error) {
    next(error);
  }
});
