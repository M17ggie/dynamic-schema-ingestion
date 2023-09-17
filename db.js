import mysql from 'mysql2';

// Create a connection pool (recommended for MySQL)
const db = mysql.createPool({
    host: 'localhost',
    user: 'raj-mhatre',
    password: 'rajmhatre',
    database: 'my-database',
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