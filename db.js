import mysql from 'mysql2';
import { fileURLToPath } from 'url';
import path from "path"

// env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, 'config', '.env')
import dotenv from 'dotenv';
dotenv.config({ path: envPath });

// Create a connection pool (recommended for MySQL)
const db = mysql.createPool({
    host: 'localhost',
    user: process.env.USER_NAME,
    password: process.env.USER_PASSWORD,
    database: process.env.DB_NAME,
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL DB:', err.message);
        return;
    }

    console.log('Connected to MySQL DB');

    // Release the acquired connection to the pool
    connection.release();
})

export default db;