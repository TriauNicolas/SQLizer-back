import { Server, Socket } from "socket.io";
import { Field, Relation, Table, Users } from "../models/models";
import { canvasGetDatabaseController } from "./databases.controllers";
import { Prisma } from "@prisma/client";
import { updateDatabaseStructure } from "../services/databases.services";

export const createTableController = async (
  socket: Socket,
  room: string,
  table: Table,
  io: Server
) => {
  try {
    const database = await canvasGetDatabaseController(room);
    if (database.tables.find((_table) => _table.name === table.name))
      throw new Error("Table already exist");

    database.tables.push(table);
    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseCreateTable", { table });
  } catch (error) {
    handleError(socket, error);
  }
};

export const createFieldController = async (
  socket: Socket,
  room: string,
  data: { field: Field; tableName: string },
  io: Server
) => {
  try {
    const database = await canvasGetDatabaseController(room);
    let databaseUpdated = false;
    database.tables.forEach((table) => {
      if (table.name === data.tableName) {
        table.fields.push(data.field);
        databaseUpdated = true;
      }
    });

    if (!databaseUpdated) throw new Error("Table does not exist");

    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseCreateField", {
      tableName: data.tableName,
      field: data.field,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export const updateTableNameController = async (
  socket: Socket,
  room: string,
  data: { tableName: string; newTableName: string },
  io: Server
) => {
  try {
    const database = await canvasGetDatabaseController(room);
    let databaseUpdated = false;
    database.tables.forEach((table) => {
      if (table.name === data.tableName) {
        table.name = data.newTableName;
        databaseUpdated = true;
      }
    });

    if (!databaseUpdated) throw new Error("Table does not exist");

    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseUpdateTableName", {
      tableName: data.tableName,
      newTableName: data.newTableName,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export const deleteTableController = async (
  socket: Socket,
  room: string,
  tableName: string,
  io: Server
) => {
  try {
    const database = await canvasGetDatabaseController(room);
    let tableIndex: number | null = null;
    database.tables.forEach((table, i) => {
      if (table.name === tableName) {
        tableIndex = i;
      }
    });

    if (!tableIndex) throw new Error("Table does not exist");

    database.relations.splice(tableIndex, 1);

    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseDeleteTable", { tableName });
  } catch (error) {
    handleError(socket, error);
  }
};

export const moveTableController = async (
  socket: Socket,
  room: string,
  data: { posX: number; posY: number; tableName: string },
  io: Server
) => {
  try {
    const database = await canvasGetDatabaseController(room);
    database.tables.forEach((_table) => {
      if (_table.name === data.tableName) {
        _table.posX = data.posX;
        _table.posY = data.posY;
      }
    });
    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseMoveTable", {
      tableName: data.tableName,
      posX: data.posX,
      posY: data.posY,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export const updateFieldController = async (
  socket: Socket,
  room: string,
  data: { tableName: string; fieldName: string; field: Field },
  io: Server
) => {
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

        if (!databaseUpdated) throw new Error("Table does not exist");
      }
    });
    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseUpdateField", {
      tableName: data.tableName,
      fieldName: data.fieldName,
      field: data.field,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export const deleteFieldController = async (
  socket: Socket,
  room: string,
  data: { tableName: string; fieldName: string },
  io: Server
) => {
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

        if (fieldIndex !== 0 && !fieldIndex)
          throw new Error("Field does not exist");

        table.fields.splice(fieldIndex, 1);
      }
    });

    await updateDatabaseStructure(room, JSON.stringify(database));
    io.in(room).emit("responseDeleteField", {
      tableName: data.tableName,
      fieldName: data.fieldName,
    });
  } catch (error) {
    handleError(socket, error);
  }
};

export const createEdgeController = async (
  socket: Socket,
  room: string,
  relation: Relation
) => {
  try {
    const database = await canvasGetDatabaseController(room);
    if (
      !database.tables.some((table) => table.name === relation.from.table) ||
      !database.tables.some((table) => table.name === relation.to.table)
    )
      throw new Error("The tables are invalids");

    if (database.relations.find((_relation) => _relation === relation))
      throw new Error("Relation already exist");

    database.relations.push(relation);
    await updateDatabaseStructure(room, JSON.stringify(database));
    socket.broadcast.to(room).emit("responseCreateEdge", relation);
  } catch (error) {
    handleError(socket, error);
  }
};

export const deleteEdgeController = async (
  socket: Socket,
  room: string,
  relation: Relation
) => {
  try {
    const database = await canvasGetDatabaseController(room);

    let relationIndex: number | null = null;
    database.relations.forEach((_relation, i) => {
      if (JSON.stringify(_relation) === JSON.stringify(relation)) {
        relationIndex = i;
      }
    });

    if (relationIndex !== 0 && !relationIndex)
      throw new Error("Relation not found");

    database.relations.splice(relationIndex, 1);

    await updateDatabaseStructure(room, JSON.stringify(database));
    socket.broadcast.to(room).emit("responseDeleteEdge", relation);
  } catch (error) {
    handleError(socket, error);
  }
};

export const userJoinRoomController = async (
  socket: Socket,
  room: string,
  user: Users
) => {
  const database = await canvasGetDatabaseController(room);
  socket.emit("responseGetDatabase", database);
  socket.broadcast
    .to(room)
    .emit("userJoinRoom", {
      lastName: user.last_name,
      firstName: user.first_name,
      imgUrl: user?.image_url,
    });
};

export const userLeaveRoomController = (
  socket: Socket,
  room: string,
  user: Users
) => {
  try {
    socket.broadcast
      .to(room)
      .emit("userLeaveRoom", {
        lastName: user.last_name,
        firstName: user.first_name,
      });
  } catch (error) {
    handleError(socket, error);
  }
};

const handleError = (socket: Socket, error) => {
  console.log(error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    socket.emit("socketError", { type: error.name, message: error.message });
  } else {
    socket.emit("socketError", {
      type: "unknownError",
      message: typeof error === "string" ? error : JSON.stringify(error),
    });
  }
};
