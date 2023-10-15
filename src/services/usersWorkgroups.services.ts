import prisma from "../core/prisma";

export const createUserWorkgroup = async (workgroup) => {
  return await prisma.users_workgroups.create({
    data: workgroup
  });
};

export const updateUsersWorkgroups = async (workgroup) => {
  return await prisma.users_workgroups.updateMany(workgroup);
};

export const getUserWorkgroupByUserId = async (user_id: string) => {
  return await prisma.users_workgroups.findMany({
    where: {
      user_id: user_id,
    },
    include: {
      workgroups: true,
    },
  });
};

export const getUserWorkgroupByUserIdAndWorkgroupId = async (userId: string, workgroupId: string, mustThrow = false) => {
  return mustThrow ? await prisma.users_workgroups.findFirstOrThrow( { where: { user_id: userId, group_id: workgroupId } } ) : await prisma.users_workgroups.findFirst( { where: { user_id: userId, group_id: workgroupId } } );
};

export const deleteManyUsersWorkgroups = async (where: Record<string, string>) => {
  return await prisma.users_workgroups.deleteMany({
    where
  });
};