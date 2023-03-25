const mysql = require('mysql2/promise');

/**
 * Initializes the Database service with connection variables stored in the local environment
 */
class Database {
    constructor(writeLog) {
        this.writeLog = writeLog;

        try {
            if (process.env.sqlPass) {
                mysql.createConnection({
                    host: process.env.sqlHost,
                    user: process.env.sqlUser,
                    password: process.env.sqlPass,
                    database: process.env.sqlData
                }).then(connection => {
                    this.connection = connection;
                    writeLog(`Connected to ${process.env.sqlData}`);
                }).catch(err => {
                    writeLog(`Unable to connect to DB: ${err}`);
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
            return await this.connection.query(sql, params, (err, result) => {
                if (err) {
                    writeLog('Error querying data:', err.stack);
                    return;
                }
                writeLog('Data inserted with ID:', result.insertId);
            });
        } catch (err) {
            console.error('Error executing query:', err);
            return null;
        }
    }

    async initDb() {
        await this.query(`CREATE TABLE IF NOT EXISTS accounts (
            id INT NOT NULL AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            PRIMARY KEY (id)
          );`).then(() => {
            this.query(`CREATE TABLE IF NOT EXISTS users (
                id INT NOT NULL AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                PRIMARY KEY (id)
              );`)
            }).then(() => {
            this.writeLog(`Database '${process.env.sqlData}' has been successfully configured.`);
          });
    }
}

module.exports = Database;
