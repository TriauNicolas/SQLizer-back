import prisma from "../core/prisma";

export const createGroup = async (dbGroupName: string, workgroupId: string) => {
  return prisma.databases_groups.create({
    data: {
      name: dbGroupName,
      workgroup_id: workgroupId,
    },
  });
};

export const getFirstDatabaseGroupByGroupId = async (group_id: string) => {
  return await prisma.databases_groups.findFirstOrThrow({
    where: { id: group_id },
  });
};

export const getFirstDatabaseGroupByGroupIdAndWorkgroupId = async (group_id: string, workgroup_id: string) => {
  return await prisma.databases_groups.findFirst({
    where: { id: group_id, workgroup_id: workgroup_id },
  });
};

export const getDatabaseGroupAndDatabasesByWorkgroupId = async (workgroup_id: string) => {
  return await prisma.databases_groups.findMany({
    where: { workgroup_id },
    include: {
      databases: {
        select: {
          id: true,
          name: true,
          updated_at: true,
        },
      },
    },
  });
};
