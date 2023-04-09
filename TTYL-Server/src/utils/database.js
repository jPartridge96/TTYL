const mysql = require('mysql2/promise');
const { writeLog } = require('./logger');

let instance = null;

/**
 * Initializes the Database service with connection variables stored in the local environment
 */
class Database {
    /**
     * Creates a new Database instance
     */
    constructor() {
        if (instance) {
            return instance;
        }

        try {
            if (process.env.sqlPass) {
                mysql.createConnection({
                    host: process.env.sqlHost,
                    user: process.env.sqlUser,
                    password: process.env.sqlPass,
                    database: process.env.sqlData
                }).then(connection => {
                    this.connection = connection;
                    writeLog(`A connection to '${process.env.sqlData}' has been established`);
                }).catch(err => {
                    writeLog(`Unable to connect to DB: ${err}`);
                });
            }
        } catch (err) {
            writeLog(`Unable to connect to DB: ${err}`);
        }

        instance = this;
    }
    /**
     * Executes the SQL query with the specified parameters
     * @param {string} sql The SQL query to be executed
     * @param {Array} params Replaces '?' inside queries in respective order
     * @returns {Promise<Array>} Rows result of the query
     */
    async query(sql, params) {
        try {
            return await this.connection.query(sql, params);
        } catch (err) {
            console.error('Error executing query:', err);
            return null;
        }
    }

    /**
     * Creates the database and tables if they do not exist
     */
    async initTables() {
      await this.query(`CREATE TABLE IF NOT EXISTS profiles (
                id INT NOT NULL AUTO_INCREMENT,
                nickname VARCHAR(50) NOT NULL,
                avatar LONGBLOB,
                PRIMARY KEY (id)
            );`).then(() => {
            this.query(`CREATE TABLE IF NOT EXISTS accounts (
                id INT NOT NULL AUTO_INCREMENT,
                phone VARCHAR(20) NOT NULL,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                dob DATE NOT NULL,
                p_id INT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (p_id) REFERENCES profiles(id)
            );`).then(() => {
            this.query(`CREATE TABLE IF NOT EXISTS connections (
                id INT NOT NULL AUTO_INCREMENT,
                p_1 INT NOT NULL,
                p_2 INT NOT NULL,
                p_1_confirm BOOLEAN NOT NULL DEFAULT FALSE,
                p_2_confirm BOOLEAN NOT NULL DEFAULT FALSE,
                PRIMARY KEY (id),
                FOREIGN KEY (p_1) REFERENCES profiles(id),
                FOREIGN KEY (p_2) REFERENCES profiles(id)
            );`).then(() => {
            this.query(`CREATE TABLE IF NOT EXISTS messages (
                id INT NOT NULL AUTO_INCREMENT,
                message VARCHAR(500) NOT NULL,
                timestamp DATETIME NOT NULL,
                sender_id INT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (sender_id) REFERENCES profiles(id)
            );`).then(() => {
            this.query(`CREATE TABLE IF NOT EXISTS conversations (
                id INT NOT NULL AUTO_INCREMENT,
                p_1 INT NOT NULL,
                p_2 INT NOT NULL,
                message_list JSON,
                PRIMARY KEY (id),
                FOREIGN KEY (p_1) REFERENCES profiles(id),
                FOREIGN KEY (p_2) REFERENCES profiles(id)
              );`).then(() => {
                writeLog(`Database and tables have been successfully created.`);
              })})})})})}
}

module.exports = new Database();
