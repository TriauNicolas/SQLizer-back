import { Router } from 'express';
import { getDatabasesController, getDatabaseController, duplicateDatabaseController, createDatabaseGroupController, renameDatabaseController, updateDatabaseController } from '../controllers/databases.controllers';

const route: Router = Router();

route.get('/getDatabases/:workgroupId', getDatabasesController);
route.get('/getDatabase/:workgroupId/:databaseId', getDatabaseController);
route.post('/createDatabaseGroup', createDatabaseGroupController);
route.put('/duplicateDatabase/', duplicateDatabaseController);
route.put('/renameDatabase', renameDatabaseController);
route.put('/updateDatabase', updateDatabaseController);

export { route as DatabaseRoute };