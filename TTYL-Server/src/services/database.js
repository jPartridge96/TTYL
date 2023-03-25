const mysql = require('mysql2/promise');

/**
 * Initializes the Database service with connection variables stored in the local environment
 */
class Database {
    constructor(writeLog) {
        this.writeLog = writeLog;

        try {
            if (process.env.sqlPass) {
                this.connection = mysql.createConnection({
                    host: process.env.sqlHost,
                    user: process.env.sqlUser,
                    password: process.env.sqlPass,
                    database: process.env.sqlData
                }).then(() => {
                    writeLog(`Connected to ${process.env.sqlData}`);
                });
            }
        } catch (err) {
            writeLog(`Unable to connect to DB: ${err}`);
        }
    }

    /**
     * Executes the SQL query with the specified parameters
     * @param {string} sql The SQL query to be executed
     * @param {Array} params Replaces '?' inside queries in respective order
     * @returns {Promise<Array>} Rows result of the query
     */
    async query(sql, params) {
        try {
            const [rows] = await this.connection.query(sql, params);
            return rows;
        } catch (err) {
            console.error('Error executing query:', err);
            return null;
        }
    }

    /**
     * Closes the open MySQL connection
     */
    async close() {
        await this.connection.end();
    }
}

module.exports = Database;
