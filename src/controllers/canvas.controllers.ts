/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUserFromRequest } from './authentication.controllers';
import prisma from '../core/prisma';
import { Socket } from 'socket.io';
import { Users } from '../models/models';
import { canvasGetDatabaseController } from './databases.controllers';
import { Prisma } from '@prisma/client';

export const createTableController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseCreateTable', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const createFieldController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseCreateField', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const updateTableNameController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseUpdateTableName', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const deleteTableController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseDeleteTable', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const moveTableController = async (socket: Socket, room: string, data: {posX: number, posY: number, tableName: string}) => {
    try {
        const database = await canvasGetDatabaseController(room);
        const table = database.tables.find((_table) => _table.name === data.tableName);
        table.posX = data.posX;
        table.posY = data.posY;
        await prisma.databases.update( { where: { id: room }, data: { structure: table } } );
        socket.to(room).emit('responseMoveTable', { tableName: table.name, posX: table.posX, posY: table.posY } );
    } catch (error) {
        handleError(error, socket);
    }
};

export const updateFieldController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseUpdateField', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const deleteFieldController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseDeleteField', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const createEdgeController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseCreateEdge', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const deleteEdgeController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseDeleteEdge', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const updateEdgeController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseUpdateEdge', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const joinRoomController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseJoinRoom', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const userJoinRoomController = async (socket: Socket, room: string, user: Users) => {
    const database = await canvasGetDatabaseController(room);
    socket.emit('responseGetDatabase', database);
    socket.broadcast.to(room).emit('userJoinRoom', { lastName: user.last_name, firstName: user.first_name, imgUrl: user?.image_url });
};

export const userLeaveRoomController = (socket: Socket, room: string, user: Users) => {
    try {
        socket.broadcast.to(room).emit('userLeaveRoom', { lastName: user.last_name, firstName: user.first_name });
    } catch (error) {
        handleError(error, socket);
    }
};

const handleError = (socket: Socket, error: any) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        socket.emit('error', {type: error.name, message: error.message});
    } else {
        socket.emit('error', {type: 'unknownError', message: JSON.stringify(error)});
    }
};
