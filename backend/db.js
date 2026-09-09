// db.js — MySQL Database Connection
// Supports both local MySQL (XAMPP) and cloud MySQL (Aiven)
// SSL is automatically enabled for cloud databases

require("dotenv").config();
const mysql = require("mysql2");

const host = process.env.DB_HOST || "127.0.0.1";
const isLocal = host === "localhost" || host === "127.0.0.1";

// Create a pool of connections to the MySQL database
const db = mysql.createPool({
    host:     host,
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME     || "medistock",

    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,

    // Keep-alive needed for cloud DBs (Aiven closes idle connections)
    enableKeepAlive:       !isLocal,
    keepAliveInitialDelay: 0,

    // SSL required for Aiven cloud — skipped for local XAMPP
    ...(isLocal ? {} : {
        ssl: { rejectUnauthorized: false }
    })
});

// Test the connection when server starts
db.getConnection((err, connection) => {
    if (err) {
        console.log("✗ Database Connection FAILED:", err.message);
        if (isLocal) {
            console.log("  → Make sure MySQL/XAMPP is running on port 3306");
            console.log("  → Make sure 'medistock' database exists");
        } else {
            console.log("  → Check your Aiven credentials in environment variables");
        }
    } else {
        console.log("✓ Database Connected Successfully!");
        console.log(`  → Host: ${host} | DB: ${process.env.DB_NAME || "medistock"}`);
        connection.release();
    }
});

module.exports = db;
