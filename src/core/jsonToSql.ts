type TableField = {
  name: string;
  type: string;
  primary_key?: boolean;
  foreign_key?: { references: string };
};

type TableRelation = {
  type: string;
  with: string;
  field: string;
  junction_table?: string;
};

type Table = {
  name: string;
  fields: TableField[];
  relations?: TableRelation[];
  junctionTable?: boolean;
};

type JSONSchema = {
  tables: Table[];
};

export default function transformJSONtoSQL(jsonData: JSONSchema): string {
  const createTableStatements = [];
  const alterTableStatements = [];

  // Create SQL tables
  for (const table of jsonData.tables) {
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${table.name} (`;
    const fields = table.fields.map((field) => {
      let fieldSQL = `${field.name} ${field.type}`;
      if (field.primary_key) {
        fieldSQL += " PRIMARY KEY";
      }
      if (field.foreign_key) {
        fieldSQL += ` REFERENCES ${field.foreign_key.references}`;
      }
      return fieldSQL;
    });
    const tableSQL = `${createTableSQL} ${fields.join(", ")});`;
    createTableStatements.push(tableSQL);

    // Create foreign key constraints for relationships
    if (table.relations) {
      for (const relation of table.relations) {
        if (relation.type === "one-to-many" || relation.type === "one-to-one") {
          const fromField = relation.field;
          const toTable = relation.with;
          const toField = jsonData.tables.find((t) => t.name === toTable)
            ?.fields[0]?.name;
          if (toField) {
            const foreignKeySQL = `ALTER TABLE ${table.name} ADD CONSTRAINT fk_${table.name}_${toTable}_${fromField} FOREIGN KEY (${fromField}) REFERENCES ${toTable}(${toField}) ON DELETE CASCADE;`;
            alterTableStatements.push(foreignKeySQL);
          }
        } else if (relation.type === "many-to-many") {
          const junctionTable = jsonData.tables.find(
            (t) => t.name === relation.junction_table
          );
          if (junctionTable) {
            const fromField = table.name.toLowerCase() + "_id";
            const toField = relation.with.toLowerCase() + "_id";
            const foreignKeyFromSQL = `ALTER TABLE ${junctionTable.name} ADD CONSTRAINT fk_${junctionTable.name}_${table.name}_${fromField} FOREIGN KEY (${fromField}) REFERENCES ${table.name}(${table.fields[0]?.name}) ON DELETE CASCADE;`;
            const foreignKeyToSQL = `ALTER TABLE ${
              junctionTable.name
            } ADD CONSTRAINT fk_${junctionTable.name}_${
              relation.with
            }_${toField} FOREIGN KEY (${toField}) REFERENCES ${relation.with}(${
              jsonData.tables.find((t) => t.name === relation.with)?.fields[0]
                ?.name
            }) ON DELETE CASCADE;`;
            alterTableStatements.push(foreignKeyFromSQL);
            alterTableStatements.push(foreignKeyToSQL);
          }
        }
      }
    }
  }

  return `${createTableStatements.join(" ")} ${alterTableStatements.join(" ")}`;
}
