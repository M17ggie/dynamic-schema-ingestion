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

const createTableSQL = async (tableName, schema) => {
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
    try {
        const result = await db.promise().query(createTableSQL);
        console.log(`Table '${tableName}' created successfully.`);
        return result;
    } catch (err) {
        console.error(`Error creating table '${tableName}':`, err);
        throw err;
    }
}

const updateMySQLTableSchema = async (tableName, schema) => {
    const alterTableSQL = `ALTER TABLE \`${tableName}\` ADD COLUMN IF NOT EXISTS \`${schema.name}\` ${schema.type} ${schema.constraints || ''}`;

    // Execute the SQL query to add the new column
    try {
        const result = await db.promise().query(alterTableSQL);
        console.log(`Table '${tableName}' schema updated successfully for column '${schema.name}'.`);
        return result;
    } catch (err) {
        console.error(`Error updating table '${tableName}' schema for column '${schema.name}':`, err);
        throw err; // Re-throw the error to handle it in the calling function if needed.
    }
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
                "constraints": "AUTO_INCREMENT PRIMARY KEY"
            },
        ],
    };

    // Create `schemas` directory if it doesn't exist.
    if (!fs.existsSync(schemaDirectory)) {
        fs.mkdirSync(schemaDirectory);
    }

    // Check if the schema file exists
    if (!fs.existsSync(schemaFilePath)) {
        // Schema file does not exist, so create it with default schema structure
        fs.writeFileSync(schemaFilePath, JSON.stringify(defaultSchema, null, 2));

        // Create a table with the default schema
        try {
            await createTableSQL(collectionName, defaultSchema);
            console.log(`Schema file and Table for collection '${collectionName}' created.`);
        } catch (error) {
            console.log(`Failed to create table for ${collectionName}`, error)
            throw error;
        }
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
            try {
                // Update the SQL table schema
                await updateMySQLTableSchema(collectionName, {
                    name: fieldName,
                    type: dataTypeAndConstraints.type,
                    constraints: dataTypeAndConstraints.constraints,
                });
                console.log(`Updated schema for collection '${collectionName}'.`);
                // Write the updated schema back to the file
                await writeFileAsync(schemaFilePath, JSON.stringify(jsonData, null, 2), { encoding: 'utf-8' });
            } catch (error) {
                console.log("Failed to update schema", error);
                throw error;
            }
        }
    }
    return true;
};