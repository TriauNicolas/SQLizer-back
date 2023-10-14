/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Databases {
  id: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  delete_interval?: bigint;
  delete_date?: Date;
  structure?: JSONdatabase;
  is_public: boolean;
  group_id?: string;
}

export interface DatabasesGroups {
  id: string;
  workgroup_id: string;
  delete_interval?: bigint;
  workgroups: Workgroups;
}

export interface Users {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  image_url?: string;
  created_at?: Date;
  users_workgroups?: UsersWorkgroups[];
  workgroups?: Workgroups[];
}

export interface UsersWorkgroups {
  user_id: string;
  group_id: string;
  create_right: boolean;
  update_right: boolean;
  delete_right: boolean;
  workgroups: Workgroups;
  users: Users;
}
export interface Workgroups {
  id: string;
  group_name: string;
  created_at?: Date;
  creator_id: string;
  databases_groups: DatabasesGroups[];
  users_workgroups: UsersWorkgroups[];
  users: Users;
  private: boolean;
}

export interface JSONdatabase {
  dbName: string;
  tables?: Table[];
  relations?: Relation[];
}

export type Table = {
  name: string;
  posX: number;
  posY: number;
  fields: Field[];
};

export type Field = {
  name: string;
  type: string;
  autoincrement: boolean;
  pk: boolean;
  nullable: boolean;
  defaultValue?: string;
};

export type Relation = {
  from: { table: string; field: string };
  to: { table: string; field: string };
};

export type JsonValue =
| string
| number
| boolean
| null
| { [property: string]: JSON }
| JSON[];
