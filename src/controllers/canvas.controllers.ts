/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getUserFromRequest } from './authentication.controllers';
import prisma from '../core/prisma';
import { Socket } from 'socket.io';
import { Users } from '../models/models';
import { canvasGetDatabaseController } from './databases.controllers';

export const createTableController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseCreateTable', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const createFieldController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseCreateField', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const updateTableNameController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseUpdateTableName', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const deleteTableController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseDeleteTable', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
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
        socket.emit('error', {type: '', message: ''});
    }
};

export const updateFieldController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseUpdateField', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const deleteFieldController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseDeleteField', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const createEdgeController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseCreateEdge', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const deleteEdgeController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseDeleteEdge', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const updateEdgeController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseUpdateEdge', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const joinRoomController = async (socket: Socket, room: string, data: any) => {
    try {

        socket.to(room).emit('responseJoinRoom', {});
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

export const userJoinRoomController = (socket: Socket, room: string, user: Users) => {
    socket.broadcast.to(room).emit('userJoinRoom', { lastName: user.last_name, firstName: user.first_name, imgUrl: user?.image_url });
};

export const userLeaveRoomController = (socket: Socket, room: string, user: Users) => {
    try {
        socket.broadcast.to(room).emit('userLeaveRoom', { lastName: user.last_name, firstName: user.first_name });
    } catch (error) {
        socket.emit('error', {type: '', message: ''});
    }
};

