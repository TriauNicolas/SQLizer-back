import { Router } from 'express';
import { Request, Response } from 'express';
import { resetPassword, forgetPassword, loginController, registerController } from '../controllers/authentication.controllers';

const route: Router = Router();

route.get('/', (req: Request, res: Response) => {
    return res.end('<h1>Connected</h1>');
});

route.post('/register', registerController);
route.post('/login', loginController);
route.post('/forgetPassword', forgetPassword);
route.put('/resetPassword', resetPassword);

export { route as AuthenticationRoute };