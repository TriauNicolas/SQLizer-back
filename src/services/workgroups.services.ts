import prisma from "../core/prisma";

export const createWorkgroup = async (group_name: string, user_id: string, isPrivate = false) => {
  return await prisma.workgroups.create({
    data: {
        group_name,
        creator_id: user_id,
        private: isPrivate,
    }
  });
};

export const getFirstWorkgroupById = async (id: string, mustThrow = false) => {
  return mustThrow ? await prisma.workgroups.findFirstOrThrow({
    where: { id },
  }) : await prisma.workgroups.findFirst({
    where: { id },
  });
};

export const getWorkGroupByGroupId = async (group_id: string) => {
  return await prisma.workgroups.findUnique({
    where: { id: group_id },
  });
};

export const deleteWorkgroup = async (id: string) => {
  return await prisma.workgroups.delete({
    where: {
      id
    }
  });
};