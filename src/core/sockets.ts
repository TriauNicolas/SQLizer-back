import { Server, Socket } from 'socket.io';
import { canUserUpdateDatabase, getUserFromToken } from '../controllers/authentication.controllers';
import { createEdgeController, createFieldController, createTableController, deleteEdgeController, deleteFieldController, deleteTableController, moveTableController, updateEdgeController, updateFieldController, updateTableNameController, userJoinRoomController, userLeaveRoomController } from '../controllers/canvas.controllers';

let io;

export async function initSocket(httpServer) {
    (io as Server) = new Server(httpServer, { path: '/sqlizer/', cors: { origin: '*' } });

    io.on('connection', async (socket: Socket & { request: {_query: { room: string } } } ) => {
        const token = Array.isArray(socket.request.headers.bearertoken) ? socket.request.headers.bearertoken[0] : socket.request.headers.bearertoken;
        if (token === null || typeof(token) === 'undefined') {
            socket.emit('error', {type: 'invalidToken', message: 'Invalid token'});
        } else {
            const canvasRoom = socket.request._query.room;
            try {
                const user = await getUserFromToken(token);

                if (!(await canUserUpdateDatabase(user.id, canvasRoom))) socket.emit('error', {type: 'permissionDenied', message: 'user is not allowed to update this database'});

                socket.join([user.id, canvasRoom]);
                console.log(user.id + ' Connected with socketId : ' + socket.id);
                await userJoinRoomController(socket, canvasRoom, user);

                // to send an event to a specific user, you must do getSocketIo().to(userId).emit('event', data)

                socket.on('disconnect', () => {
                    userLeaveRoomController(socket, canvasRoom, user);
                });

                socket.on('requestCreateTable', async (data) => {
                    await createTableController(socket, canvasRoom, data);
                });

                socket.on('requestCreateField', async (data) => {
                    await createFieldController(socket, canvasRoom, data);
                });

                socket.on('requestUpdateTableName', async (data) => {
                    await updateTableNameController(socket, canvasRoom, data);
                });

                socket.on('requestDeleteTable', async (data) => {
                    await deleteTableController(socket, canvasRoom, data);
                });

                socket.on('requestMoveTable', async (data) => {
                    await moveTableController(socket, canvasRoom, data);
                });

                socket.on('requestUpdateField', async (data) => {
                    await updateFieldController(socket, canvasRoom, data);
                });

                socket.on('requestDeleteField', async (data) => {
                    await deleteFieldController(socket, canvasRoom, data);
                });

                socket.on('requestCreateEdge', async (data) => {
                    await createEdgeController(socket, canvasRoom, data);
                });

                socket.on('requestDeleteEdge', async (data) => {
                    await deleteEdgeController(socket, canvasRoom, data);
                });

                socket.on('requestUpdateEdge', async (data) => {
                    await updateEdgeController(socket, canvasRoom, data);
                });
            } catch (error) {
                socket.emit('error', {type: 'invalidToken', message: error.message});
            }
        }
    });
}

export function getSocketIo(): Server {
	return io as Server;
}