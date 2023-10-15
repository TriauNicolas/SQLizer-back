import { Router } from 'express';
import { getWorkgroupsController, createWorkgroupController, addUserToWorkgroupController, deleteWorkgroupController, updateUserRightController, removeUserOfWorkgroupController, getWorkgroupsDatasController, updateUserCreateRightController, updateUserDeleteRightController, updateUserUpdateRightController } from '../controllers/workgroups.controllers';

const route: Router = Router();

route.get('/', getWorkgroupsController);
route.post('/createWorkgroup', createWorkgroupController);
route.put('/addUserToWorkgroup', addUserToWorkgroupController);
route.delete('/deleteWorkgroup', deleteWorkgroupController);
route.put('/updateUserRight', updateUserRightController);
route.put('/updateUserCreateRight', updateUserCreateRightController);
route.put('/updateUserUpdateRight', updateUserUpdateRightController);
route.put('/updateUserDeleteRight', updateUserDeleteRightController);
route.delete('/removeUserOfWorkgroup', removeUserOfWorkgroupController);
route.get('/getUserWorkgroupsDatas', getWorkgroupsDatasController);

export { route as WorkgroupsRoute };