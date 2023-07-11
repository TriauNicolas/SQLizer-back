/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Databases {
  id: string;
  name?: string;
  created_at?: Date;
  updated_at?: Date;
  delete_interval?: bigint;
  delete_date?: Date;
  structure?: Record<string, any>;
  is_public: boolean;
}

export interface DatabasesGroups {
  id: string;
  workgroup_id: string;
  delete_interval?: bigint;
  workgroups: Workgroups;
}

export interface Users {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  image_url?: string;
  created_at?: Date;
  users_workgroups?: UsersWorkgroups[];
  workgroups?: Workgroups[];
  verified?: boolean;
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
}
