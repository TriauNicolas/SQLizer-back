import { Request, Response } from "express";
import prisma from "../core/prisma";
import { z } from "zod";
import transformJSONtoSQL from "../core/jsonToSql";

export const transformJSONtoSQLController = async (
  req: Request,
  res: Response
) => {
  // const validation = z.object({
  //   table:
  // });

  try {
    const json = req.body;
    const translation = transformJSONtoSQL(json);
    res.json({ sql: translation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
