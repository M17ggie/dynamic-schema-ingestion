import db from "../db.js";
import { createOrUpdateSchemaHandler } from "./helpers.js";

const executeSelectQuery = (query, collectionName, res) => {
    db.query(query, collectionName, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send({ error: 'Database error.' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).send({ error: 'Record not found.' });
        }

        return res.send({ success: true, data: result });
    });
};

export const insertRecords = async (req, res) => {
    const { collection } = req.params;
    const data = req.body;
    const query = `INSERT INTO \`${collection}\` SET ?`

    try {

        await createOrUpdateSchemaHandler(collection, data);

        db.query(query, data, (err, result) => {
            if (err) {
                console.error("Error adding entry", err);
                return res.status(500).send({ error: 'Database error.' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).send({ error: 'Record not found.' });
            }

            return res.send({ success: true, id: result.insertId });
        })
    } catch (err) {
        console.error('Error creating or updating schema:', err);
        return res.status(500).send({ error: 'Schema error.' });
    }
}

export const getRecords = (req, res) => {
    const { collection } = req.params;
    const query = `SELECT * FROM ${collection}`;

    executeSelectQuery(query, collection, res);
}

export const getRecordById = (req, res) => {
    const { collection, id } = req.params;
    const query = `SELECT * FROM  ${collection} WHERE id=${id}`;

    executeSelectQuery(query, collection, res)
}

export const updateRecordById = (req, res) => {
    const { collection, id } = req.params;

    executeSelectQuery(query, collection, res)
}