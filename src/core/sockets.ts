import { Server, Socket } from 'socket.io';
import { getUserFromToken } from '../controllers/authentication.controllers';

let io;

export async function initSocket(httpServer) {
    (io as Server) = new Server(httpServer, { path: '/sqlizer/', cors: { origin: '*' } });

    io.on('connection', async (socket: Socket) => {
        socket.join('room1');
        const token = Array.isArray(socket.request.headers.bearertoken) ? socket.request.headers.bearertoken[0] : socket.request.headers.bearertoken;
        if (token === null || typeof(token) === 'undefined') {
            console.log('Invalid Token');
        } else {
            try {
                const user = await getUserFromToken(token);
                socket.join(user.id);
                console.log(user.id + ' Connected with socketId : ' + socket.id);
            } catch (error) {
                console.log(error.message);
            }
        }
    });
}

export function getSocketIo() {
	return io as Server;
}