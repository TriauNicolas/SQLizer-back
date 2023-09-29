import { Request, Response } from 'express';
import prisma from '../core/prisma';
import { z } from 'zod';
import { getUserFromRequest } from './authentication.controllers';
import { JSONdatabase, JsonValue } from '../models/models';

const defaultDBSchema: JsonValue = JSON.stringify({
    dbName: 'master',
    tables: [],
    relations: []
});

export const getDatabasesController = async (req: Request, res: Response) => {
    try {
        const workgroupId = req.params.workgroupId;
        const user = await getUserFromRequest(req);

        const userWorkgroup = await prisma.users_workgroups.findFirst( { where: { user_id: user.id, group_id: workgroupId } } );
        if (!userWorkgroup) throw new Error('Group does not exist or user is not in group');

        const groups = await prisma.databases_groups.findMany({
            where: {workgroup_id: userWorkgroup.group_id},
            include: {
                databases: {
                    select: {
                        id: true,
                        name: true,
                        updated_at: true
                    }
                }
            }
        });

        res.json( { databases: groups } );
    } catch (error) {
        res.status(400).json( { error: error.message } );
    }
};

export const getDatabaseController = async (req: Request, res: Response) => {
    try {
        const user = await getUserFromRequest(req);
        const workgroupId = req.params.workgroupId;
        const databaseId = req.params.databaseId;

        const userWorkgroup = await prisma.users_workgroups.findFirst( { where: { user_id: user.id, group_id: workgroupId } } );
        if (!userWorkgroup) throw new Error('Group does not exist or user is not in group');

        const db = await prisma.databases.findFirst( { where: { id: databaseId } });

        const dbGroup = await prisma.databases_groups.findFirst({
            where: { id: db.group_id, workgroup_id: workgroupId }
        });

        if (!dbGroup || !db) throw new Error('db does not exist or is not in the group');

        res.json( { database: db } );
    } catch (error) {
        res.status(400).json( { error: error.message } );
    }
};

export const duplicateDatabaseController = async (req: Request, res: Response) => {
    const validation = z.object({
        databaseId: z.string().nonempty(),
        workgroupId: z.string().nonempty(),
        databaseGroupId: z.string().nonempty()
    });

    try {
        const user = await getUserFromRequest(req);
        const groupQuery = validation.parse(req.body);

        const userWorkgroup = await prisma.users_workgroups.findFirst( { where: { user_id: user.id, group_id: groupQuery.workgroupId } } );
        if (!userWorkgroup) throw new Error('Group does not exist or user is not in group');
        if (!userWorkgroup.create_right) throw new Error('User is not allowed to create a database');

        const database = await prisma.databases.findFirst({ where: { id: groupQuery.databaseId, group_id: groupQuery.databaseGroupId } });
        database.created_at = new Date();
        database.updated_at = new Date();
        database.name = database.name + '_copy';


        const response = await prisma.databases.create( { data: database } );
        res.json( { success: true, response } );
    } catch (error) {
        res.status(400).json( { error: error.message } );
    }
};

export const createDatabaseGroupController = async (req: Request, res: Response) => {
    const validation = z.object({
        workgroupId: z.string().nonempty(),
        dbGroupName: z.string().nonempty()
    });

    try {
        const user = await getUserFromRequest(req);
        const groupQuery = validation.parse(req.body);

        const userWorkgroup = await prisma.users_workgroups.findFirst( { where: { user_id: user.id, group_id: groupQuery.workgroupId } } );
        if (!userWorkgroup) throw new Error('Group does not exist or user is not in group');
        if (!userWorkgroup.create_right) throw new Error('User is not allowed to create a database');

        const group = await prisma.databases_groups.create({
            data: { name: groupQuery.dbGroupName, workgroup_id: groupQuery.workgroupId }
        });

        const database = await prisma.databases.create( {
            data: {
                name: 'master',
                created_at: new Date,
                updated_at: new Date,
                structure: defaultDBSchema,
                is_public: false,
                group_id: group.id,
            }
        } );

        res.json(database);

    } catch (error) {
        res.status(400).json( { error: error.message } );
    }
};

export const renameDatabaseController = async (req: Request, res: Response) => {
    const validation = z.object({
        databaseId: z.string().nonempty(),
        databaseName: z.string().nonempty(),
        workgroupId: z.string().nonempty()
    });

    try {
        const user = await getUserFromRequest(req);
        const groupQuery = validation.parse(req.body);

        const userWorkgroup = await prisma.users_workgroups.findFirst( { where: { user_id: user.id, group_id: groupQuery.workgroupId } } );
        if (!userWorkgroup) throw new Error('Group does not exist or user is not in group');
        if (!userWorkgroup.update_right) throw new Error('User is not allowed to update the database');

        const database = await prisma.databases.update( {
            where: {
                id: groupQuery.databaseId
            },
            data: {
                name: groupQuery.databaseName
            }
        } );

        res.json(database);

    } catch (error) {
        res.status(400).json( { error: error.message } );
    }
};

export const updateDatabaseController = async (req: Request, res: Response) => {
    const validation = z.object({
        databaseId: z.string().nonempty(),
        databaseJson: z.string().nonempty(), //stringified
        workgroupId: z.string().nonempty()
    });

    try {
        const user = await getUserFromRequest(req);
        const groupQuery = validation.parse(req.body);

        const userWorkgroup = await prisma.users_workgroups.findFirst( { where: { user_id: user.id, group_id: groupQuery.workgroupId } } );
        if (!userWorkgroup) throw new Error('Group does not exist or user is not in group');
        if (!userWorkgroup.update_right) throw new Error('User is not allowed to update the database');

        const database = await prisma.databases.update( {
            where: {
                id: groupQuery.databaseId
            },
            data: {
                structure: groupQuery.databaseJson
            }
        } );

        res.json(database);

    } catch (error) {
        res.status(400).json( { error: error.message } );
    }
};

export const canvasGetDatabaseController = async (databaseId: string): Promise<JSONdatabase> => {
    const db = await prisma.databases.findFirstOrThrow({ where: { id: databaseId } });
    return JSON.parse(db.structure as string) as JSONdatabase;
};
