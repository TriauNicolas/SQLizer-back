import prisma from '../core/prisma';
import { Socket } from 'socket.io';
import { Field, Relation, Table, Users } from '../models/models';
import { canvasGetDatabaseController } from './databases.controllers';
import { Prisma } from '@prisma/client';

export const createTableController = async (socket: Socket, room: string, table: Table) => {
    try {
        const database = await canvasGetDatabaseController(room);
        if (database.tables.find(_table => _table.name === table.name))
            throw new Error('Table already exist');

        database.tables.push(table);
        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseCreateTable', { table });
    } catch (error) {
        handleError(error, socket);
    }
};

export const createFieldController = async (socket: Socket, room: string, data: { field: Field, tableName: string }) => {
    try {
        const database = await canvasGetDatabaseController(room);
        let databaseUpdated = false;
        database.tables.forEach(table => {
            if (table.name === data.tableName) {
                table.fields.push(data.field);
                databaseUpdated = true;
            }
        });

        if (!databaseUpdated)
            throw new Error('Table does not exist');

        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseCreateField', { tableName: data.tableName, field: data.field } );
    } catch (error) {
        handleError(error, socket);
    }
};

export const updateTableNameController = async (socket: Socket, room: string, data: { tableName: string, newTableName: string }) => {
    try {
        const database = await canvasGetDatabaseController(room);
        let databaseUpdated = false;
        database.tables.forEach(table => {
            if (table.name === data.tableName) {
                table.name = data.newTableName;
                databaseUpdated = true;
            }
        });

        if (!databaseUpdated)
            throw new Error('Table does not exist');

        socket.to(room).emit('responseUpdateTableName', {tableName: data.tableName, newTableName: data.newTableName});
    } catch (error) {
        handleError(error, socket);
    }
};

export const deleteTableController = async (socket: Socket, room: string, tableName: string) => {
    try {
        const database = await canvasGetDatabaseController(room);
        let tableIndex: number | null = null;
        database.tables.forEach((table, i) => {
            if (table.name === tableName) {
                tableIndex = i;
            }
        });

        if (!tableIndex)
            throw new Error('Table does not exist');

        database.relations.splice(tableIndex, 1);

        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );

        socket.to(room).emit('responseDeleteTable', {});
    } catch (error) {
        handleError(error, socket);
    }
};

export const moveTableController = async (socket: Socket, room: string, data: { posX: number, posY: number, tableName: string }) => {
    try {
        const database = await canvasGetDatabaseController(room);
        database.tables.forEach(_table => {
            if (_table.name === data.tableName) {
                _table.posX = data.posX;
                _table.posY = data.posY;
            }
        });
        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseMoveTable', { tableName: data.tableName, posX: data.posX, posY: data.posY } );
    } catch (error) {
        handleError(error, socket);
    }
};

export const updateFieldController = async (socket: Socket, room: string, data: { tableName: string, fieldName: string, field: Field }) => {
    try {
        const database = await canvasGetDatabaseController(room);

        let databaseUpdated = false;
        database.tables.forEach((table) => {
            if (table.name === data.tableName) {
                table.fields.forEach((field) => {
                    if (field.name === data.fieldName) {
                        field = data.field;
                        databaseUpdated = true;
                    }
                });

                if (!databaseUpdated)
                    throw new Error('Table does not exist');
            }
        });
        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseUpdateField', {tableName: data.tableName, fieldName: data.fieldName, field: data.field});
    } catch (error) {
        handleError(error, socket);
    }
};

export const deleteFieldController = async (socket: Socket, room: string, data: { tableName: string, fieldName: string }) => {
    try {
        const database = await canvasGetDatabaseController(room);

        let fieldIndex: number | null = null;
        database.tables.forEach((table) => {
            if (table.name === data.tableName) {
                table.fields.forEach((field, i) => {
                    if (field.name === data.fieldName) {
                        fieldIndex = i;
                    }
                });

                if (!fieldIndex)
                    throw new Error('Table does not exist');

                table.fields.splice(fieldIndex, 1);
            }
        });

        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseDeleteField', {tableName: data.tableName, fieldName: data.fieldName});
    } catch (error) {
        handleError(error, socket);
    }
};

export const createEdgeController = async (socket: Socket, room: string, relation: Relation) => {
    try {
        const database = await canvasGetDatabaseController(room);
        if (!database.tables.some(table => table.name === relation.from.table) || !database.tables.some(table => table.name === relation.to.table))
            throw new Error('The tables are invalids');

        if (database.relations.find(_relation => _relation === relation))
            throw new Error('Relation already exist');

        database.relations.push(relation);
        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseCreateEdge', relation);
    } catch (error) {
        handleError(error, socket);
    }
};

export const deleteEdgeController = async (socket: Socket, room: string, relation: Relation) => {
    try {
        const database = await canvasGetDatabaseController(room);
        let relationIndex: number | null = null;
        database.relations.forEach((_relation, i) => {
            if (_relation === relation) {
                relationIndex = i;
            }
        });

        if (!relationIndex)
            throw new Error('Table does not exist');

        database.relations.splice(relationIndex, 1);

        await prisma.databases.update( { where: { id: room }, data: { structure: JSON.stringify(database) } } );
        socket.to(room).emit('responseDeleteEdge', relation);
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

const handleError = (socket: Socket, error) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        socket.emit('socketError', {type: error.name, message: error.message});
    } else {
        socket.emit('socketError', {type: 'unknownError', message: JSON.stringify(error)});
    }
};
