import db from "../db.js";
import { createOrUpdateSchemaHandler } from "./helpers.js";

const executeSelectQuery = (query, collectionName, res) => {
    db.query(query, collectionName, (err, result) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }

        if (result.length) {
            return res.send({ success: true, data: result });
        }
        return res.status(404).send({ error: 'Record not found.' });

    });
};

// insert collections
export const insertRecords = async (req, res) => {
    const { collection } = req.params;
    const { data } = req.body;
    const query = `INSERT INTO \`${collection}\` SET ?`

    if (data.length === 0) {
        return res.status(400).send("Data you sent seems to be empty")
    }

    for (let i = 0; i < data.length; i++) {
        try {
            await createOrUpdateSchemaHandler(collection, data[i]);
            db.query(query, data[i], (err, result) => {
                if (err) {
                    return res.status(500).send({ error: err.message });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).send({ error: 'Record not found.' });
                }

                if (i === data.length - 1) {
                    return res.send({ success: true, message: "Records saved succesfully" });
                }
            })
        } catch (err) {
            return res.status(500).send({ error: 'Error creating or updating schema' });
        }
    }
}

// fetch entire collection
export const getRecords = (req, res) => {
    const { collection } = req.params;
    const query = `SELECT * FROM ${collection}`;

    executeSelectQuery(query, collection, res);
}

// fetch a record by id
export const getRecordById = (req, res) => {
    const { collection, id } = req.params;
    const query = `SELECT * FROM  \`${collection}\` WHERE id=${id}`;

    executeSelectQuery(query, collection, res)
}

// update a record by id
export const updateRecordById = (req, res) => {
    const { collection, id } = req.params;
    const updatedData = req.body;

    // Check if the collection exists
    const collectionExistsQuery = `SELECT 1 FROM information_schema.tables WHERE table_name = ?`;

    db.query(collectionExistsQuery, [collection], (collectionErr, collectionResult) => {
        if (collectionErr) {
            console.error(`Error checking if collection '${collection}' exists:`, collectionErr);
            return res.status(500).send({ error: 'Database error.' });
        }

        if (collectionResult.length === 0) {
            // The collection does not exist, return a 404 error response
            return res.status(404).send({ error: 'Collection not found.' });
        }

        // Construct the UPDATE query with the SET clause
        const updateQuery = `UPDATE \`${collection}\` SET ? WHERE id = ?`;

        // Execute the UPDATE query to update the entry with the specified ID
        db.query(updateQuery, [updatedData, id], (err, result) => {
            if (err) {
                console.error(`Error updating entry in '${collection}' with ID ${id}:`, err);
                return res.status(500).send({ error: 'Update error.' });
            }

            // Check if any rows were affected by the update
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: 'Record not found.' });
            }

            // Return a success response
            res.send({ success: true, message: `Entry in '${collection}' with ID ${id} updated successfully.` });
        });
    });
}

// delete a record by id
export const deleteRecordById = (req, res) => {
    const { collection, id } = req.params;

    // Check if the collection exists
    const collectionExistsQuery = `SELECT 1 FROM information_schema.tables WHERE table_name = ?`;

    db.query(collectionExistsQuery, [collection], (collectionErr, collectionResult) => {
        if (collectionErr) {
            console.error(`Error checking if collection '${collection}' exists:`, collectionErr);
            return res.status(500).send({ error: 'Database error.' });
        }

        if (collectionResult.length === 0) {
            // The collection does not exist, return a 404 error response
            return res.status(404).send({ error: 'Collection not found.' });
        }

        // Construct the DELETE query
        const deleteQuery = `DELETE FROM \`${collection}\` WHERE id = ?`;

        // Execute the DELETE query to delete the entry with the specified ID
        db.query(deleteQuery, [id], (err, result) => {
            if (err) {
                console.error(`Error deleting entry in '${collection}' with ID ${id}:`, err);
                return res.status(500).send({ error: 'Delete error.' });
            }

            // Check if any rows were affected by the delete
            if (result.affectedRows === 0) {
                return res.status(404).send({ error: 'Record not found.' });
            }

            // Return a success response
            res.send({ success: true, message: `Entry in '${collection}' with ID ${id} deleted successfully.` });
        });
    });
}