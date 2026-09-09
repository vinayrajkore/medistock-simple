// db.js — MySQL Database Connection
// Uses a connection pool so multiple requests can be handled at once

require("dotenv").config();
const mysql = require("mysql2");

// Create a pool of connections to the MySQL database
const db = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",   // XAMPP default: empty password
    database: process.env.DB_NAME || "medistock",

    waitForConnections: true,   // Wait if no free connections
    connectionLimit: 10,        // Max 10 connections in pool
    queueLimit: 0               // Unlimited queue
});

// Test the connection when server starts
db.getConnection((err, connection) => {
    if (err) {
        console.log("✗ Database Connection FAILED:", err.message);
        console.log("  Make sure MySQL is running on port 3306 and the 'medistock' database exists.");
    } else {
        console.log("✓ Database Connected Successfully!");
        connection.release(); // Return connection to pool
    }
});

module.exports = db;
