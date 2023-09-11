import { Server, Socket } from 'socket.io';
import { getUserFromToken } from '../controllers/authentication.controllers';

let io;

export async function initSocket(httpServer) {
    (io as Server) = new Server(httpServer, { path: '/sqlizer/', cors: { origin: '*' } });

    io.on('connection', async (socket: Socket & { request: {_query: { room: string } } } ) => {
        socket.join('room1');
        const token = Array.isArray(socket.request.headers.bearertoken) ? socket.request.headers.bearertoken[0] : socket.request.headers.bearertoken;
        if (token === null || typeof(token) === 'undefined') {
            console.log('Invalid Token');
        } else {
            try {
                const user = await getUserFromToken(token);
                socket.join([user.id, socket.request._query.room]);
                io.to(socket.request._query.room).emit('lorem');
                console.log(user.id + ' Connected with socketId : ' + socket.id);
                // to send an event to a specific user, you must do getSocketIo().to(userId).emit('event', data)
            } catch (error) {
                console.log(error.message);
            }
        }
    });
}

export function getSocketIo(): Server {
	return io as Server;
}