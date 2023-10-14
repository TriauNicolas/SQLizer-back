import prisma from "../core/prisma";

export const getFirstWorkgroup = async (workgroup_id: string) => {
  return await prisma.workgroups.findFirstOrThrow({
    where: { id: workgroup_id },
  });
};
