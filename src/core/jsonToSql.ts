export default function translateJSONtoSQL(jsonData) {
  const sqlCommands = [];

  // Start with creating the database
  sqlCommands.push(`CREATE DATABASE ${jsonData.dbName};`);
  sqlCommands.push(`USE ${jsonData.dbName};`);

  // Create the tables
  jsonData.tables.forEach((table) => {
    let command = `CREATE TABLE ${table.name} (`;
    const primaryKeys = [];

    table.fields.forEach((field, index) => {
      command += `${field.name} ${field.type}`;

      if (field.autoIncrement) {
        command += " AUTO_INCREMENT";
      }
      if (!field.nullable) {
        command += " NOT NULL";
      }
      if (field.pk) {
        primaryKeys.push(field.name);
      }

      // Add comma for next field, unless it's the last one
      if (index < table.fields.length - 1) {
        command += ", ";
      }
    });

    // Handle composite primary keys
    if (primaryKeys.length > 0) {
      command += `, PRIMARY KEY (${primaryKeys.join(", ")})`;
    }

    command += ");";
    sqlCommands.push(command);
  });

  // Add relations (foreign keys)
  jsonData.relations.forEach((relation) => {
    const fkTable = relation.from.table;
    const fkField = relation.from.field;
    const pkTable = relation.to.table;
    const pkField = relation.to.field;

    const command = `ALTER TABLE ${fkTable} ADD FOREIGN KEY (${fkField}) REFERENCES ${pkTable}(${pkField});`;
    sqlCommands.push(command);
  });

  console.log(sqlCommands.join("\n"));
  return sqlCommands.join("");
}
