-- -- Create the user
-- DO $$ BEGIN
--   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'sqlizeradmin') THEN
--     CREATE USER sqlizeradmin WITH PASSWORD 'mypassword';
--   END IF;
-- END $$;

-- -- Grant administrative rights
-- ALTER USER sqlizeradmin WITH SUPERUSER;

-- -- Create the database
-- CREATE DATABASE IF NOT EXISTS sqlizer;

-- -- Connect to the database
-- \c sqlizer

-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the users table
CREATE TABLE IF NOT EXISTS "users" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT current_timestamp,
);

-- Create the workgroups table
CREATE TABLE IF NOT EXISTS "workgroups" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT current_timestamp,
  creator_id UUID NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- Create the junction table between users and workgroups (many-to-many)
CREATE TABLE IF NOT EXISTS "users_workgroups" (
  user_id UUID NOT NULL,
  group_id UUID NOT NULL,
  create_right BOOLEAN NOT NULL DEFAULT FALSE,
  update_right BOOLEAN NOT NULL DEFAULT FALSE,
  delete_right BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, group_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (group_id) REFERENCES workgroups(id)
);

-- Create the databases_groups table
CREATE TABLE IF NOT EXISTS "databases_groups" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  workgroup_id UUID NOT NULL,
  delete_interval BIGINT,
  FOREIGN KEY (workgroup_id) REFERENCES workgroups(id)
);

-- Create the databases table
CREATE TABLE IF NOT EXISTS "databases" (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT current_timestamp,
  updated_at TIMESTAMP DEFAULT current_timestamp,
  delete_interval BIGINT,
  delete_date TIMESTAMP,
  structure JSONB,
  is_public BOOLEAN NOT NULL DEFAULT FALSE
);

-- Functions & Triggers
CREATE OR REPLACE FUNCTION "update_updated_at"()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = current_timestamp;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_update_updated_at"
BEFORE UPDATE ON databases
FOR EACH ROW
EXECUTE FUNCTION "update_updated_at"();

CREATE OR REPLACE FUNCTION "update_delete_date"()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.delete_interval IS NOT NULL) THEN
    NEW.delete_date = NEW.updated_at + NEW.delete_interval;
  ELSE
    NEW.delete_date = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_update_delete_date"
BEFORE INSERT OR UPDATE ON databases
FOR EACH ROW
EXECUTE FUNCTION "update_delete_date"();

CREATE OR REPLACE FUNCTION "delete_row"()
RETURNS TRIGGER AS $$
BEGIN
  IF (NEW.delete_interval IS NOT NULL) THEN
    IF (NEW.delete_date IS NOT NULL AND NEW.delete_date <= current_timestamp) THEN
      DELETE FROM databases WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trigger_delete_row"
BEFORE INSERT OR UPDATE ON databases
FOR EACH ROW
WHEN (OLD.delete_date IS DISTINCT FROM NEW.delete_date AND NEW.delete_date <= current_timestamp)
EXECUTE FUNCTION "delete_row"();
