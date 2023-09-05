interface TableField {
  name: string;
  type: string;
  primary_key: string;
  foreign_key: { references: "students(student_id)"; on_delete: "CASCADE" };
}

interface Table {
  name: string;
  fields: TableField[];
}

interface Relationship {
  type: string;
  from: string;
  to: string;
  field: string;
  junction_table: string;
  junction_from_field: string;
  junction_to_field: string;
}

interface JSONSchema {
  tables: Table[];
  relations: Relationship[];
}

export default function transformJSONtoSQL(jsonData: JSONSchema): string {
  const sqlStatements = [];

  // Create SQL tables
  for (const table of jsonData.tables) {
    const createTableSQL = `CREATE TABLE IF NOT EXISTS ${table.name} (`;
    const fields = table.fields.map((field) => {
      let fieldSQL = `${field.name} ${field.type}`;
      if (field.primary_key) {
        fieldSQL += " PRIMARY KEY";
      }
      if (field.foreign_key) {
        fieldSQL += `, FOREIGN KEY (${field.name}) REFERENCES ${field.foreign_key.references} ON DELETE CASCADE`;
      }
      return fieldSQL;
    });
    const tableSQL = `${createTableSQL} ${fields.join(", ")});`;
    sqlStatements.push(tableSQL);
  }

  // Create SQL relationships, including many-to-many
  for (const relation of jsonData.relations) {
    const {
      from,
      to,
      field,
      junction_table,
      junction_from_field,
      junction_to_field,
    } = relation;

    if (junction_table) {
      const createJunctionTableSQL = `CREATE TABLE IF NOT EXISTS ${junction_table} (${junction_from_field} INTEGER REFERENCES ${from}(${
        jsonData.tables.find((t) => t.name === from)?.fields[0].name
      }),${junction_to_field} INTEGER REFERENCES ${to}(${
        jsonData.tables.find((t) => t.name === to)?.fields[0].name
      }),PRIMARY KEY (${junction_from_field}, ${junction_to_field}));`;
      sqlStatements.push(createJunctionTableSQL);
    } else {
      const foreignKeySQL = `ALTER TABLE ${from} ADD CONSTRAINT fk_${from}_${to}_${field} FOREIGN KEY (${field}) REFERENCES ${to}(${
        jsonData.tables
          .find((t) => t.name === to)
          ?.fields.find((f) => f.primary_key)?.name
      }) ON DELETE CASCADE;`;
      sqlStatements.push(foreignKeySQL);
    }
  }

  return sqlStatements.join("");
}

// TODO: Créer les junctions tables depuis le json en vrai tables depuis le front
