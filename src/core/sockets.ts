import { Server, Socket } from 'socket.io';
import { canUserUpdateDatabase, getUserFromToken } from '../controllers/authentication.controllers';
import { createEdgeController, createFieldController, createTableController, deleteEdgeController, deleteFieldController, deleteTableController, moveTableController, updateFieldController, updateTableNameController, userJoinRoomController, userLeaveRoomController } from '../controllers/canvas.controllers';
import { Field, Relation, Table } from '../models/models';

let io;

export async function initSocket(httpServer) {
    (io as Server) = new Server(httpServer, { path: '/sqlizer/', cors: { origin: '*' } });

    io.on('connection', async (socket: Socket & { request: {_query: { room: string } } } ) => {
        const token = Array.isArray(socket.request.headers.bearertoken) ? socket.request.headers.bearertoken[0] : socket.request.headers.bearertoken;
        if (token === null || typeof(token) === 'undefined') {
            socket.emit('socketError', {type: 'invalidToken', message: 'Invalid token'});
        } else {
            const canvasRoom = socket.request._query.room;
            try {
                const user = await getUserFromToken(token);
                if (!(await canUserUpdateDatabase(user.id, canvasRoom))) socket.emit('socketError', {type: 'permissionDenied', message: 'user is not allowed to update this database'});

                socket.join([user.id, canvasRoom]);
                console.log(user.id + ' Connected with socketId : ' + socket.id);
                await userJoinRoomController(socket, canvasRoom, user);

                // to send an event to a specific user, you must do getSocketIo().to(userId).emit('event', data)

                socket.on('disconnect', () => {
                    userLeaveRoomController(socket, canvasRoom, user);
                });

                socket.on('requestCreateTable', async (table: Table) => {
                    await createTableController(socket, canvasRoom, table, io);
                });

                socket.on('requestCreateField', async (data: { field: Field, tableName: string }) => {
                    await createFieldController(socket, canvasRoom, data, io);
                });

                socket.on('requestUpdateTableName', async (data: { tableName: string, newTableName: string }) => {
                    await updateTableNameController(socket, canvasRoom, data, io);
                });

                socket.on('requestDeleteTable', async (tableName: string) => {
                    await deleteTableController(socket, canvasRoom, tableName, io);
                });

                socket.on('requestMoveTable', async (data: { posX: number, posY: number, tableName: string }) => {
                    await moveTableController(socket, canvasRoom, data, io);
                });

                socket.on('requestUpdateField', async (data: { tableName: string, fieldName: string, field: Field }) => {
                    await updateFieldController(socket, canvasRoom, data, io);
                });

                socket.on('requestDeleteField', async (data: { tableName: string, fieldName: string }) => {
                    await deleteFieldController(socket, canvasRoom, data, io);
                });

                socket.on('requestCreateEdge', async (relation: Relation) => {
                    await createEdgeController(socket, canvasRoom, relation, io);
                });

                socket.on('requestDeleteEdge', async (relation: Relation) => {
                    await deleteEdgeController(socket, canvasRoom, relation, io);
                });
            } catch (error) {
                socket.emit('socketError', {type: 'invalidToken', message: error.message});
            }
        }
    });
}

export function getSocketIo(): Server {
	return io as Server;
}