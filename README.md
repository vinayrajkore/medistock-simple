# MediStock Simple 💊

A simple pharmacy inventory management system built with:
- **Frontend**: Plain HTML + CSS + Vanilla JavaScript
- **Backend**: Node.js + Express.js
- **Database**: MySQL

---

## 📁 Project Structure

```
medistock-simple/
├── backend/
│   ├── server.js       ← All API routes (register, login, medicines, billing, etc.)
│   ├── db.js           ← MySQL database connection
│   ├── .env            ← Database credentials (you must edit this)
│   └── package.json
├── frontend/
│   ├── index.html      ← Home page
│   ├── register.html   ← Register
│   ├── login.html      ← Login
│   ├── dashboard.html  ← Stats dashboard
│   ├── medicines.html  ← Medicine CRUD
│   ├── customers.html  ← Generate bills
│   ├── history.html    ← Invoice history
│   ├── chatbot.html    ← AI chatbot
│   ├── profile.html    ← User profile
│   ├── css/style.css   ← All styles in one file
│   └── js/auth.js      ← Shared auth utilities
└── database.sql        ← Run this in MySQL to create tables
```

---

## 🚀 How to Run

### Step 1: Set up the Database
1. Open MySQL Workbench (or command line)
2. Run the file: `database.sql`
3. This creates the `medistock` database with all 3 tables

### Step 2: Configure Backend
1. Open `backend/.env`
2. Edit your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=medistock
   PORT=1000
   ```

### Step 3: Install & Start Backend
```bash
cd backend
npm install
node server.js
```

You should see:
```
==========================================
  MediStock Server running on port 1000
  Open: http://localhost:1000
==========================================
Database Connected Successfully!
```

### Step 4: Open the App
Open your browser and go to: **http://localhost:1000**

---

## 📋 Features

| Feature | Description |
|---------|-------------|
| Register | Create account with name, email, password (bcrypt hashed) |
| Login | Login and store session in localStorage |
| Dashboard | View 6 stats: medicines, customers, invoices, sales, low stock, expired |
| Medicines | Add / Edit / Delete medicines with full details |
| Billing | Generate invoices, auto-deduct stock from inventory |
| History | View all past invoices |
| Chatbot | Ask questions about your inventory in plain English |
| Profile | View and update your profile |

---

## 🛢️ Database Tables

### users
| Column | Type | Description |
|--------|------|-------------|
| user_id | INT (PK) | Auto-increment |
| name | VARCHAR | User's name |
| email | VARCHAR (UNIQUE) | Login email |
| password | VARCHAR | bcrypt hashed |

### medicines
| Column | Type | Description |
|--------|------|-------------|
| medicine_id | INT (PK) | Auto-increment |
| user_id | INT (FK) | Belongs to which user |
| medicine_name | VARCHAR | Name of medicine |
| company_name | VARCHAR | Manufacturer |
| batch_no | VARCHAR | Batch number |
| expiry_date | DATE | Expiry date |
| quantity | INT | Current stock |
| price | DECIMAL | Price per unit |

### customers
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| customer_id | VARCHAR | Customer's ID |
| invoice_no | VARCHAR | Invoice number (INV + timestamp) |
| medicine_name | VARCHAR | Medicine purchased |
| quantity | INT | Units purchased |
| total_amount | DECIMAL | Line item total |

---

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /register | Register new user |
| POST | /login | Login user |
| GET | /dashboard/:user_id | Get all dashboard stats |
| GET | /medicines/:user_id | Get all medicines |
| POST | /medicines | Add medicine |
| PUT | /medicines/:id | Update medicine |
| DELETE | /medicines/:id | Delete medicine |
| POST | /bill | Generate invoice |
| GET | /history/:user_id | Invoice history |
| POST | /chatbot | Ask chatbot |
| GET | /profile/:user_id | Get profile |
| PUT | /profile/:user_id | Update profile |
