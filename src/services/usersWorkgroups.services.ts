import prisma from "../core/prisma";

export const getUserWorkgroupByUserIdAndWorkgroupId = async (userId: string, workgroupId: string, mustThrow = false) => {
  return mustThrow ? await prisma.users_workgroups.findFirstOrThrow( { where: { user_id: userId, group_id: workgroupId } } ) : await prisma.users_workgroups.findFirst( { where: { user_id: userId, group_id: workgroupId } } );
};
