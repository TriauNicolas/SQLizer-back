import { Router } from 'express';
import { getWorkgroupsController, createWorkgroupController, addUserToWorkgroupController, deleteWorkgroupController, updateUserRightController, removeUserOfWorkgroupController, getWorkgroupsDatasController } from '../controllers/workgroups.controllers';

const route: Router = Router();

route.get('/', getWorkgroupsController);
route.post('/createWorkgroup', createWorkgroupController);
route.put('/addUserToWorkgroup', addUserToWorkgroupController);
route.delete('/deleteWorkgroup', deleteWorkgroupController);
route.put('/updateUserRight', updateUserRightController);
route.delete('/removeUserOfWorkgroup', removeUserOfWorkgroupController);
route.get('/getUserWorkgroupsDatas', getWorkgroupsDatasController);

export { route as WorkgroupsRoute };