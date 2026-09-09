// server.js — MediStock Simple Backend
// This is the main server file. It handles all API requests from the frontend.
// Tech: Node.js + Express.js + MySQL

require("dotenv").config();
const express = require("express");
const bcrypt  = require("bcrypt");
const cors    = require("cors");
const db      = require("./db");

const app = express();

// =============================================
// MIDDLEWARE
// =============================================

// Allow requests from any origin
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// NOTE: No static file serving here — React frontend runs on Vite (port 5173)
//       This server is API-only (port 1000)


// =============================================
// AUTH APIs
// =============================================

// POST /register — Create a new user account
app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input fields
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    db.query("SELECT user_id FROM users WHERE email = ?", [email], async (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });

        if (rows.length > 0) {
            return res.status(409).json({ success: false, message: "Email already registered" });
        }

        // Hash the password before saving (never store plain text passwords)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const sql = "INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())";
        db.query(sql, [name.trim(), email.trim().toLowerCase(), hashedPassword], (insertErr, result) => {
            if (insertErr) return res.status(500).json({ success: false, message: "Registration failed" });

            return res.status(201).json({ success: true, message: "Registration successful! Please login." });
        });
    });
});

// POST /login — Login with email and password
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Find user by email
    db.query("SELECT * FROM users WHERE email = ?", [email.trim().toLowerCase()], async (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const user = rows[0];

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        // Login successful — send user info back (no token needed for simplicity)
        return res.json({
            success: true,
            message: "Login successful",
            user: { user_id: user.user_id, name: user.name, email: user.email }
        });
    });
});


// =============================================
// DASHBOARD APIs
// =============================================

// GET /dashboard/recent-medicines/:user_id — Recently added medicines for dashboard table
// NOTE: This route MUST come BEFORE /dashboard/:user_id to avoid Express matching 'recent-medicines' as user_id
app.get("/dashboard/recent-medicines/:user_id", (req, res) => {
    const { user_id } = req.params;
    const sql = `
        SELECT medicine_name, company_name, quantity, price, expiry_date
        FROM medicines
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
    `;
    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, data: rows });
    });
});

// GET /dashboard/:user_id — Get all dashboard statistics in one request
app.get("/dashboard/:user_id", (req, res) => {
    const { user_id } = req.params;

    // We run 6 queries in parallel using counter approach
    let results = {};
    let completed = 0;
    const total = 6;

    function checkDone() {
        completed++;
        if (completed === total) {
            res.json({ success: true, data: results });
        }
    }

    // 1. Total medicines
    db.query("SELECT COUNT(*) AS count FROM medicines WHERE user_id = ?", [user_id], (err, rows) => {
        results.total_medicines = err ? 0 : rows[0].count;
        checkDone();
    });

    // 2. Total customers
    db.query("SELECT COUNT(DISTINCT customer_id) AS count FROM customers WHERE user_id = ?", [user_id], (err, rows) => {
        results.total_customers = err ? 0 : rows[0].count;
        checkDone();
    });

    // 3. Total invoices
    db.query("SELECT COUNT(DISTINCT invoice_no) AS count FROM customers WHERE user_id = ?", [user_id], (err, rows) => {
        results.total_invoices = err ? 0 : rows[0].count;
        checkDone();
    });

    // 4. Total sales
    db.query("SELECT COALESCE(SUM(total_amount), 0) AS total FROM customers WHERE user_id = ?", [user_id], (err, rows) => {
        results.total_sales = err ? 0 : rows[0].total;
        checkDone();
    });

    // 5. Low stock (medicines with quantity <= 10)
    db.query("SELECT COUNT(*) AS count FROM medicines WHERE user_id = ? AND quantity <= 10", [user_id], (err, rows) => {
        results.low_stock = err ? 0 : rows[0].count;
        checkDone();
    });

    // 6. Expired medicines (expiry date is in the past)
    db.query("SELECT COUNT(*) AS count FROM medicines WHERE user_id = ? AND expiry_date < CURDATE()", [user_id], (err, rows) => {
        results.expired_medicines = err ? 0 : rows[0].count;
        checkDone();
    });
});



// =============================================
// MEDICINE APIs
// =============================================

// GET /medicines/:user_id — Get all medicines for this user
app.get("/medicines/:user_id", (req, res) => {
    const { user_id } = req.params;
    const sql = `
        SELECT medicine_id, medicine_name, company_name, batch_no, expiry_date, quantity, price
        FROM medicines
        WHERE user_id = ?
        ORDER BY medicine_name ASC
    `;
    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, data: rows });
    });
});

// POST /medicines — Add a new medicine
app.post("/medicines", (req, res) => {
    const { user_id, medicine_name, company_name, batch_no, expiry_date, quantity, price } = req.body;

    // Validate all fields
    if (!user_id || !medicine_name || !company_name || !batch_no || !expiry_date || quantity === undefined || price === undefined) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (Number(quantity) < 0 || Number(price) < 0) {
        return res.status(400).json({ success: false, message: "Quantity and price must be positive" });
    }

    const sql = `
        INSERT INTO medicines (user_id, medicine_name, company_name, batch_no, expiry_date, quantity, price, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    db.query(sql, [user_id, medicine_name.trim(), company_name.trim(), batch_no.trim(), expiry_date, Number(quantity), Number(price)], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to add medicine" });
        res.status(201).json({ success: true, message: "Medicine added successfully", medicine_id: result.insertId });
    });
});

// PUT /medicines/:medicine_id — Update an existing medicine
app.put("/medicines/:medicine_id", (req, res) => {
    const { medicine_id } = req.params;
    const { user_id, medicine_name, company_name, batch_no, expiry_date, quantity, price } = req.body;

    if (!medicine_name || !company_name || !batch_no || !expiry_date || quantity === undefined || price === undefined) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const sql = `
        UPDATE medicines
        SET medicine_name = ?, company_name = ?, batch_no = ?, expiry_date = ?, quantity = ?, price = ?, updated_at = NOW()
        WHERE medicine_id = ? AND user_id = ?
    `;
    db.query(sql, [medicine_name.trim(), company_name.trim(), batch_no.trim(), expiry_date, Number(quantity), Number(price), medicine_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to update medicine" });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Medicine not found" });
        res.json({ success: true, message: "Medicine updated successfully" });
    });
});

// DELETE /medicines/:medicine_id — Delete a medicine
app.delete("/medicines/:medicine_id", (req, res) => {
    const { medicine_id } = req.params;
    const { user_id } = req.query;

    db.query("DELETE FROM medicines WHERE medicine_id = ? AND user_id = ?", [medicine_id, user_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to delete medicine" });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Medicine not found" });
        res.json({ success: true, message: "Medicine deleted successfully" });
    });
});

// GET /medicines/search/:user_id?q=name — Search medicines by name
app.get("/medicines/search/:user_id", (req, res) => {
    const { user_id } = req.params;
    const { q } = req.query;

    if (!q) return res.status(400).json({ success: false, message: "Search term required" });

    const sql = `
        SELECT medicine_id, medicine_name, company_name, quantity, price, expiry_date
        FROM medicines
        WHERE user_id = ? AND LOWER(medicine_name) LIKE LOWER(?)
        ORDER BY medicine_name ASC
    `;
    db.query(sql, [user_id, `%${q}%`], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, data: rows });
    });
});


// =============================================
// CUSTOMER / BILLING APIs
// =============================================

// GET /customers/:user_id — Get all unique customers for this user
app.get("/customers/:user_id", (req, res) => {
    const { user_id } = req.params;
    const sql = `
        SELECT customer_id, customer_name, mobile, doctor_name, MAX(visit_date) AS last_visit
        FROM customers
        WHERE user_id = ?
        GROUP BY customer_id, customer_name, mobile, doctor_name
        ORDER BY last_visit DESC
    `;
    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, data: rows });
    });
});

// POST /bill — Generate a new bill/invoice for a customer
// This deducts stock from medicines and creates invoice records
app.post("/bill", async (req, res) => {
    const { customer_id, customer_name, mobile, doctor_name, visit_date, user_id, items } = req.body;

    // Validate input
    if (!customer_id || !customer_name || !mobile || !doctor_name || !visit_date || !user_id || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Generate unique invoice number
    const invoice_no = "INV" + Date.now();

    // Get a connection for transaction (all-or-nothing: either all stock is deducted OR none)
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        let grandTotal = 0;

        // Process each medicine item in the bill
        for (const item of items) {
            const { medicine_id, quantity } = item;
            const qty = Number(quantity);

            // Check if medicine has enough stock
            const [medRows] = await connection.query(
                "SELECT medicine_name, price, quantity FROM medicines WHERE medicine_id = ? AND user_id = ?",
                [medicine_id, user_id]
            );

            if (medRows.length === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Medicine not found" });
            }

            const med = medRows[0];

            if (med.quantity < qty) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${med.medicine_name}. Available: ${med.quantity}`
                });
            }

            const itemTotal = qty * med.price;
            grandTotal += itemTotal;

            // Deduct stock from medicine
            await connection.query(
                "UPDATE medicines SET quantity = quantity - ?, updated_at = NOW() WHERE medicine_id = ? AND user_id = ?",
                [qty, medicine_id, user_id]
            );

            // Insert a row in customers table for this medicine
            await connection.query(
                `INSERT INTO customers (customer_id, user_id, customer_name, mobile, doctor_name, visit_date, invoice_no, medicine_name, quantity, price, total_amount, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
                [customer_id, user_id, customer_name.trim(), mobile.trim(), doctor_name.trim(), visit_date, invoice_no, med.medicine_name, qty, med.price, itemTotal]
            );
        }

        // Commit the transaction — everything succeeded
        await connection.commit();
        connection.release();

        return res.json({
            success: true,
            message: "Bill generated successfully",
            invoice_no,
            total_amount: grandTotal
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error("Bill generation error:", error);
        return res.status(500).json({ success: false, message: "Failed to generate bill" });
    }
});


// =============================================
// HISTORY APIs
// =============================================

// GET /history/:user_id — Get all invoice history
app.get("/history/:user_id", (req, res) => {
    const { user_id } = req.params;
    const sql = `
        SELECT
            invoice_no,
            customer_name,
            mobile,
            doctor_name,
            visit_date,
            medicine_name,
            quantity,
            price,
            total_amount,
            created_at
        FROM customers
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;
    db.query(sql, [user_id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, data: rows });
    });
});


// =============================================
// PROFILE APIs
// =============================================

// GET /profile/:user_id — Get user profile info
app.get("/profile/:user_id", (req, res) => {
    const { user_id } = req.params;
    db.query("SELECT user_id, name, email, created_at FROM users WHERE user_id = ?", [user_id], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        if (rows.length === 0) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user: rows[0] });
    });
});

// PUT /profile/:user_id — Update user name
app.put("/profile/:user_id", (req, res) => {
    const { user_id } = req.params;
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, message: "Name must be at least 2 characters" });
    }

    db.query("UPDATE users SET name = ?, updated_at = NOW() WHERE user_id = ?", [name.trim(), user_id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Database error" });
        res.json({ success: true, message: "Name updated successfully" });
    });
});


// =============================================
// CHATBOT API
// =============================================

// POST /chatbot — Simple rule-based chatbot that answers inventory questions
app.post("/chatbot", async (req, res) => {
    const { message, user_id } = req.body;

    if (!message || !user_id) {
        return res.status(400).json({ success: false, message: "Message and user_id required" });
    }

    const msg = message.toLowerCase().trim();

    try {
        // Fetch all data needed for answers
        const [medicines] = await db.promise().query("SELECT * FROM medicines WHERE user_id = ?", [user_id]);
        const [customers] = await db.promise().query("SELECT * FROM customers WHERE user_id = ?", [user_id]);
        const [userRows]  = await db.promise().query("SELECT name, email FROM users WHERE user_id = ?", [user_id]);

        const currentUser  = userRows[0] || { name: "User", email: "" };
        const totalMeds    = medicines.length;
        const totalUnits   = medicines.reduce((sum, m) => sum + Number(m.quantity), 0);
        const lowStock     = medicines.filter(m => m.quantity <= 10);
        const today        = new Date(); today.setHours(0,0,0,0);
        const expired      = medicines.filter(m => m.expiry_date && new Date(m.expiry_date) < today);
        const uniqueCustomers = new Set(customers.map(c => c.customer_id)).size;
        const uniqueInvoices  = new Set(customers.map(c => c.invoice_no)).size;
        const totalSales   = customers.reduce((sum, c) => sum + Number(c.total_amount || 0), 0);

        // Helper: check if any keyword is in the message
        const has = (...words) => words.some(w => msg.includes(w));

        let answer = "";

        // Check for specific medicine name
        const matchedMed = medicines.find(m => msg.includes(m.medicine_name.toLowerCase()));

        if (has("hello", "hi", "hey")) {
            answer = `Hello ${currentUser.name}! I'm MediBot. Ask me about your medicines, stock, customers, or sales.`;
        }
        else if (has("how many medicine", "total medicine", "medicine count")) {
            answer = `You have ${totalMeds} type(s) of medicines with a total of ${totalUnits} units in stock.`;
        }
        else if (has("low stock", "low medicines", "running out")) {
            if (lowStock.length === 0) {
                answer = "Great news! All medicines have sufficient stock (more than 10 units each).";
            } else {
                const list = lowStock.map(m => `${m.medicine_name} (${m.quantity} units)`).join(", ");
                answer = `${lowStock.length} medicine(s) are low on stock: ${list}`;
            }
        }
        else if (has("expired", "expiry")) {
            if (expired.length === 0) {
                answer = "No expired medicines found.";
            } else {
                const list = expired.map(m => m.medicine_name).join(", ");
                answer = `${expired.length} expired medicine(s): ${list}`;
            }
        }
        else if (has("customer", "patients")) {
            answer = `You have ${uniqueCustomers} unique customer(s) on record.`;
        }
        else if (has("invoice", "bill")) {
            answer = `You have ${uniqueInvoices} invoice(s) generated so far.`;
        }
        else if (has("sales", "revenue", "earning", "total amount")) {
            answer = `Total sales: Rs. ${Number(totalSales).toFixed(2)} from ${uniqueInvoices} invoice(s).`;
        }
        else if (has("summary", "dashboard", "overview")) {
            answer = `MediStock Summary for ${currentUser.name}:\n` +
                     `Medicines: ${totalMeds} types, ${totalUnits} units\n` +
                     `Low Stock: ${lowStock.length} medicine(s)\n` +
                     `Expired: ${expired.length} medicine(s)\n` +
                     `Customers: ${uniqueCustomers}\n` +
                     `Invoices: ${uniqueInvoices}\n` +
                     `Total Sales: Rs. ${Number(totalSales).toFixed(2)}`;
        }
        else if (has("profile", "my name", "who am i", "my email")) {
            answer = `You are logged in as ${currentUser.name} (${currentUser.email}).`;
        }
        else if (matchedMed) {
            const expDate = matchedMed.expiry_date
                ? new Date(matchedMed.expiry_date).toLocaleDateString("en-IN")
                : "N/A";
            answer = `${matchedMed.medicine_name}:\n` +
                     `Company: ${matchedMed.company_name}\n` +
                     `Quantity: ${matchedMed.quantity} units\n` +
                     `Price: Rs. ${matchedMed.price}\n` +
                     `Batch No: ${matchedMed.batch_no}\n` +
                     `Expiry: ${expDate}`;
        }
        else {
            answer = "I'm not sure about that. Try asking:\n" +
                     "- How many medicines do I have?\n" +
                     "- Show low stock medicines\n" +
                     "- Show expired medicines\n" +
                     "- Total sales\n" +
                     "- How many customers?\n" +
                     "- [Medicine name] for details";
        }

        return res.json({ success: true, answer });

    } catch (error) {
        console.error("Chatbot error:", error);
        return res.status(500).json({ success: false, message: "Chatbot error" });
    }
});


// =============================================
// CATCH-ALL: Serve index.html for unknown routes
// =============================================
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


// =============================================
// START SERVER
// =============================================
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
    console.log("==========================================");
    console.log(`  MediStock Server running on port ${PORT}`);
    console.log(`  Open: http://localhost:${PORT}`);
    console.log("==========================================");
});
