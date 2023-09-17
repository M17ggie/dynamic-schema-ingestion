import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaDirectory = path.join(__dirname, 'schemas');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const assignDataTypeHandler = (data) => {
    const dataType = typeof data;
    switch (dataType) {
        case "string": return {
            "type": "VARCHAR(255)",
            "constraints": "DEFAULT NULL"
        }

        case "number": return {
            "type": "INT",
            "constraints": "DEFAULT NULL"
        }

        case "boolean": return {
            "type": "BOOLEAN",
            "constraints": ""
        }

        default: return {
            "type": "VARCHAR(255)",
            "constraints": "DEFAULT NULL"
        }
    }
}

const createTableSQL = (tableName, schema) => {
    const { columns } = schema;

    const createTableSQL = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      ${columns
            .map(
                (column) =>
                    `\`${column.name}\` ${column.type} ${column.constraints || ''}`
            )
            .join(',\n')}
    )`;

    // Execute the SQL query to create the table
    db.query(createTableSQL, (err, result) => {
        if (err) {
            console.error(`Error creating table '${tableName}':`, err);
        } else {
            console.log(`Table '${tableName}' created successfully.`);
        }
    });
}

const updateMySQLTableSchema = (tableName, schema) => {
    // Generate ALTER TABLE statements to add new columns
    console.log("COLUMNS =>", schema)
    const query = `ALTER TABLE \`${tableName}\` ADD COLUMN IF NOT EXISTS \`${schema.name}\` ${schema.type} ${schema.constraints || ''}`;

    // Execute the SQL queries to add new columns
    db.query(query, (err, result) => {
        if (err) {
            console.error(`Error updating table '${tableName}' schema:`, err);
        } else {
            console.log(`Table '${tableName}' schema updated successfully.`);
        }
    });
};

export const doesSchemaExistHandler = (collectionName) => {
    const schemaFileName = `${collectionName}.json`;
    const schemaFilePath = path.join(schemaDirectory, schemaFileName);
    try {
        // Check if the schema file exists
        fs.accessSync(schemaFilePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

export const createOrUpdateSchemaHandler = async (collectionName, collectionData) => {
    const schemaFileName = `${collectionName}.json`;
    const schemaFilePath = path.join(schemaDirectory, schemaFileName);

    const defaultSchema = {
        table_name: collectionName,
        columns: [
            {
                "name": "id",
                "type": "INT",
                "constraints": "PRIMARY KEY AUTO INCREMENT"
            },
        ],
    };

    if (!fs.existsSync(schemaDirectory)) {
        fs.mkdirSync(schemaDirectory);
    }

    try {
        // Check if the schema file exists
        if (!fs.existsSync(schemaFilePath)) {
            // Schema file does not exist, so create it with default schema structure
            fs.writeFileSync(schemaFilePath, JSON.stringify(defaultSchema, null, 2));

            // Create a table with the schema
            createTableSQL(collectionName, defaultSchema);
            console.log(`Schema for collection '${collectionName}' created.`);
        }

        // Read the existing schema JSON from the file
        const schemaContent = await readFileAsync(schemaFilePath, { encoding: 'utf-8' });

        const jsonData = JSON.parse(schemaContent);
        for (const [fieldName, fieldValue] of Object.entries(collectionData)) {
            // Check if the field exists in the existing schema
            const fieldExists = jsonData.columns.some((column) => column.name === fieldName);
            if (!fieldExists) {
                // Field doesn't exist, add it to the schema
                const dataTypeAndConstraints = assignDataTypeHandler(fieldValue);

                // Add the new field to the existing schema
                jsonData.columns.push({
                    name: fieldName,
                    type: dataTypeAndConstraints.type,
                    constraints: dataTypeAndConstraints.constraints,
                });

                console.log(`Added field '${fieldName}' to schema for collection '${collectionName}'.`);

                // Update the SQL table schema
                updateMySQLTableSchema(collectionName, {
                    name: fieldName,
                    type: dataTypeAndConstraints.type,
                    constraints: dataTypeAndConstraints.constraints,
                });

                // Write the updated schema back to the file
                await writeFileAsync(schemaFilePath, JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
            }
        }
    } catch (err) {
        console.error('Error creating or updating schema:', err);
    }
};