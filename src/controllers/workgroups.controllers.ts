import { Request, Response } from "express";
import { getUserFromRequest } from "./authentication.controllers";
import { z } from "zod";
import {
  createWorkgroup,
  deleteWorkgroup,
  getFirstWorkgroupById,
  getWorkGroupByGroupId,
} from "../services/workgroups.services";
import {
  createUserWorkgroup,
  deleteManyUsersWorkgroups,
  getUserWorkgroupByGroupId,
  getUserWorkgroupByUserId,
  getUserWorkgroupByUserIdAndWorkgroupId,
  updateUsersWorkgroups,
} from "../services/usersWorkgroups.services";
import {
  getUserByEmail,
  getUserById,
} from "../services/authentication.services";

export const getWorkgroupsController = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);

    const response = await getUserWorkgroupByUserId(user.id);
    res.json({ workgroups: response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createWorkgroupController = async (
  req: Request,
  res: Response
) => {
  const validation = z.object({
    group_name: z.string().nonempty(),
  });

  try {
    const user = await getUserFromRequest(req);
    const groupQuery = validation.parse(req.body);

    const workgroup = await createWorkgroup(groupQuery.group_name, user.id);

    const newWorkgroup = await createUserWorkgroup({
      user_id: user.id,
      group_id: workgroup.id,
      create_right: true,
      update_right: true,
      delete_right: true,
    });
    res.json({ workgroup: newWorkgroup });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addUserToWorkgroupController = async (
  req: Request,
  res: Response
) => {
  const validation = z.object({
    email: z.string().nonempty(),
    create_right: z.boolean().nullable().optional(),
    update_right: z.boolean().nullable().optional(),
    delete_right: z.boolean().nullable().optional(),
    groupId: z.string().nonempty(),
  });

  try {
    const query = validation.parse(req.body);
    await getUserFromRequest(req);

    const user = await getUserByEmail(query.email);

    if (!user) throw new Error("Invalid User");

    const group = await getWorkGroupByGroupId(query.groupId);

    if (!group) throw new Error("Group Not Found");

    if (await getUserWorkgroupByUserIdAndWorkgroupId(user.id, group.id))
      throw new Error("User already in the group");

    await createUserWorkgroup({
      user_id: user.id,
      group_id: group.id,
      create_right: !!query?.create_right,
      update_right: !!query?.update_right,
      delete_right: !!query?.delete_right,
    });

    res.json({
        success: true,
        user: {
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            rights: {
                create_right: !!query?.create_right,
                update_right: !!query?.update_right,
                delete_right: !!query?.delete_right
            }
        }});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteWorkgroupController = async (
  req: Request,
  res: Response
) => {
  const validation = z.object({
    group_id: z.string().nonempty(),
  });

  try {
    const query = validation.parse(req.body);
    const user = await getUserFromRequest(req);

    const relation = await getUserWorkgroupByUserIdAndWorkgroupId(
      user.id,
      query.group_id
    );

    if (!relation.delete_right) throw new Error("User cannot delete the group");

    await deleteManyUsersWorkgroups({ group_id: query.group_id });

    const response = await deleteWorkgroup(query.group_id);

    res.json({ success: true, response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserRightController = async (
  req: Request,
  res: Response
) => {
  const validation = z.object({
    userId: z.string().nonempty(),
    groupId: z.string().nonempty(),
    rights: z.object({
      create_right: z.boolean(),
      update_right: z.boolean(),
      delete_right: z.boolean(),
    }),
  });
  try {
    const query = validation.parse(req.body);

    const user = await getUserFromRequest(req);

    const workgroup = await getFirstWorkgroupById(query.groupId);

    if (!workgroup) throw new Error("Workgroup not found");

    if (workgroup.creator_id !== user.id)
      throw new Error("Non-admin user can't edit rights");

    const updatedUser = await getUserById(query.userId);

    if (!updatedUser) throw new Error("User not found");

    const response = await updateUsersWorkgroups(
      {
        user_id: updatedUser.id,
        group_id: workgroup.id,
      },
      {
        create_right: !!query.rights.create_right,
        update_right: !!query.rights.update_right,
        delete_right: !!query.rights.delete_right,
      },
    );

    res.json({ success: true, response });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeUserOfWorkgroupController = async (
  req: Request,
  res: Response
) => {
  const validation = z.object({
    userId: z.string().nonempty(),
    groupId: z.string().nonempty(),
  });
  try {
    const query = validation.parse(req.body);

    const user = await getUserFromRequest(req);

    const workgroup = await getFirstWorkgroupById(query.groupId);

    if (!workgroup) throw new Error('Workgroup not found');

    if (workgroup.creator_id !== user.id)
        throw new Error("Non-admin user can't remove user");

    const removedUser = await getUserById(query.userId);

    if (!removedUser) throw new Error('User not found');

    const response = await deleteManyUsersWorkgroups({ user_id: removedUser.id, group_id: workgroup.id });

    res.json({success: true, response});
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWorkgroupsDatasController = async (req: Request, res: Response) => {
    try {
        const user = await getUserFromRequest(req);
        const userWorkgroups = await getUserWorkgroupByUserId(user.id);
        const response = [];

        for (const workgroup of userWorkgroups) {
            console.log(workgroup);
            const formatedData: {group_name: string; group_id: string; is_admin: boolean, rights: { create_right: boolean; update_right: boolean; delete_right: boolean }, users?: { first_name: string; last_name: string; email: string; rights: { create_right: boolean; update_right: boolean; delete_right: boolean; } }[] } = {
                group_name: workgroup.workgroups.group_name,
                is_admin: user.id === workgroup.workgroups.creator_id,
                group_id: workgroup.workgroups.id,
                rights: {
                    create_right: workgroup.create_right,
                    update_right: workgroup.update_right,
                    delete_right: workgroup.delete_right
                }
            };

            if (formatedData.is_admin) {
                formatedData.users = [];

                const usersRelations =  await getUserWorkgroupByGroupId(workgroup.group_id);

                usersRelations.forEach(relation => {
                    const formatedUser: {user_id: string; first_name: string; last_name: string; email: string; rights: { create_right: boolean; update_right: boolean; delete_right: boolean; } } = {
                        user_id: relation.users.id,
                        first_name: relation.users.first_name,
                        last_name: relation.users.last_name,
                        email: relation.users.email,
                        rights: {
                            create_right: relation.create_right,
                            update_right: relation.update_right,
                            delete_right: relation.delete_right
                        }
                    };

                    formatedData.users.push(formatedUser);
                });
            }
            response.push(formatedData);
        }
        res.json({success: true, groups: response});

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateUserCreateRightController = async (req: Request, res: Response) => {
        const validation = z.object({
        userId: z.string().nonempty(),
        groupId: z.string().nonempty(),
        create_right: z.boolean(),
    });
    try {
        const query = validation.parse(req.body);

        const user = await getUserFromRequest(req);

        const workgroup = await getFirstWorkgroupById(query.groupId);
        if (!workgroup) throw new Error('Workgroup not found');

        if (workgroup.creator_id !== user.id) throw new Error('Non-admin user can\'t edit rights');

        const updatedUser = await getUserById(query.userId);
        if (!updatedUser) throw new Error('User not found');

        const response = await updateUsersWorkgroups(
          {
            user_id: updatedUser.id,
            group_id: workgroup.id
          },
          {
            create_right: !!query.create_right,
          }
        );       

        res.json({success: true, response});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateUserUpdateRightController = async (req: Request, res: Response) => {
        const validation = z.object({
        userId: z.string().nonempty(),
        groupId: z.string().nonempty(),
        update_right: z.boolean(),
    });
    try {
        const query = validation.parse(req.body);

        const user = await getUserFromRequest(req);

        const workgroup = await getFirstWorkgroupById(query.groupId);
        if (!workgroup) throw new Error('Workgroup not found');

        if (workgroup.creator_id !== user.id) throw new Error('Non-admin user can\'t edit rights');

        const updatedUser = await getUserById(query.userId);
        if (!updatedUser) throw new Error('User not found');

        const response = await updateUsersWorkgroups(
          {
            user_id: updatedUser.id,
            group_id: workgroup.id
          },
          {
            update_right: !!query.update_right,
          }
        );

        res.json({success: true, response});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateUserDeleteRightController = async (req: Request, res: Response) => {
        const validation = z.object({
        userId: z.string().nonempty(),
        groupId: z.string().nonempty(),
        delete_right: z.boolean()
    });
    try {
        const query = validation.parse(req.body);

        const user = await getUserFromRequest(req);

        const workgroup = await getWorkGroupByGroupId(query.groupId);
        if (!workgroup) throw new Error('Workgroup not found');

        if (workgroup.creator_id !== user.id) throw new Error('Non-admin user can\'t edit rights');

        const updatedUser = await getUserById(query.userId);
        if (!updatedUser) throw new Error('User not found');

        const response = await updateUsersWorkgroups(
          {
            user_id: updatedUser.id,
            group_id: workgroup.id
          },
          {
            delete_right: !!query.delete_right
          }
        );

        res.json({success: true, response});
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const leaveWorkgroupController = async (req: Request, res: Response) => {
    try {
        const user = await getUserFromRequest(req);
        const workgroupId = req.params.workgroupId;

        const workgroup = await getFirstWorkgroupById(workgroupId, true);

        if (workgroup.creator_id === user.id) throw new Error("You cannot leave a group that you created");

        await deleteManyUsersWorkgroups({
          user_id: user.id,
          group_id: workgroup.id
        });

        res.json({success: true});
    } catch (error) {
        res.status(400).json({ error: error.message });

    }
};
