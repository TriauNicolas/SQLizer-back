import prisma from "../core/prisma";
import { JSONdatabase } from "../models/models";

export const createDatabase = async (database) => {
  return await prisma.databases.create({ data: database });
};

export const updateDatabaseName = async (databaseId: string, databaseName: string) => {
  return await prisma.databases.update({
    where: {
      id: databaseId,
    },
    data: {
      name: databaseName,
    },
  });
};

export const updateDatabaseStructure = async (id: string, database: string | JSONdatabase) => {
  const db = typeof database === 'string' ? database : JSON.stringify(database);
  return prisma.databases.update({
    where: {
      id: id,
    },
    data: {
      structure: db,
    },
  });
};

export const getFirstDatabaseByDatabaseId = async (databaseId: string) => {
  return await prisma.databases.findFirstOrThrow({
    where: { id: databaseId },
  });
};

export const getFirstDatabaseByIdAndGroupId = async (id: string, group_id: string) => {
  return await prisma.databases.findFirst({
    where: {
      id,
      group_id,
    },
  });
};



