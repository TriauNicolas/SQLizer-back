import { Router } from "express";
import { transformJSONtoSQLController } from "../controllers/translation.controller";

const route: Router = Router();

route.post("/translateJsonToSql", transformJSONtoSQLController);
// TODO: later, route.post("/translateSqlToJson", transformSQLtoJSON);

export { route as TranslationRoute };
