# Simple Expense Tracker — Full-Stack MVP

A clean, minimalist full-stack expense tracking web application built to monitor personal finances with category filtering and monthly aggregations.

## Architecture

`GitHub → Vercel Frontend → Render Backend/API → Aiven MySQL`

* **GitHub**: Hosts the repository and version control.
* **Vercel**: Hosts the React (Vite) frontend with SPA client-side routing.
* **Render**: Hosts the Node.js / Express.js REST API service.
* **Aiven MySQL**: Fully managed cloud MySQL database instance with mandatory SSL.

---

## MVP Features

- **Dashboard**:
  - Total expenses sum
  - Expense count
  - Current month's expenditure total
- **Expense Management**:
  - Add expense (Amount, Category, Description, Date)
  - View all expenses in a clean, responsive table
  - Edit existing expense
  - Delete expense with user confirmation
- **Category Filtering**:
  - Filter expenses by: `All`, `Food`, `Transport`, `Shopping`, `Bills`, `Other`

---

## Technology Stack

- **Frontend**: React, Vite, React Router, Fetch API, Vanilla CSS (Modern design with Inter typography, cards, badges)
- **Backend**: Node.js, Express.js, MySQL2 (with connection pooling & SSL), dotenv, CORS, Helmet
- **Database**: Aiven MySQL (8.x) with exactly 2 tables: `categories` and `expenses`

---

## Database Schema

```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  description VARCHAR(255) NOT NULL,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

Seeded Categories:
1. `Food`
2. `Transport`
3. `Shopping`
4. `Bills`
5. `Other`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/categories` | Get the 5 seeded categories |
| `GET` | `/api/dashboard` | Get total amount, count, and current month total |
| `GET` | `/api/expenses` | Get all expenses (supports `?category=...`) |
| `GET` | `/api/expenses/:id` | Get single expense by ID |
| `POST` | `/api/expenses` | Create a new expense |
| `PUT` | `/api/expenses/:id` | Update an existing expense |
| `DELETE` | `/api/expenses/:id` | Delete an expense by ID |

---

## Project Structure

```
expense-tracker/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── AddExpense.jsx
│   │   │   └── EditExpense.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vercel.json
│   ├── vite.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── expenseController.js
│   ├── routes/
│   │   └── api.js
│   ├── schema.sql
│   ├── initDb.js
│   ├── testApi.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Local Setup & Development

### 1. Database Setup
Ensure your Aiven MySQL database is accessible. Copy the environment configuration:
```bash
cp server/.env.example server/.env
```
Fill in the environment variables:
```env
DB_HOST=your-mysql-host.aivencloud.com
DB_PORT=your_port
DB_USER=avnadmin
DB_PASSWORD=your_password
DB_NAME=defaultdb
DB_SSL=REQUIRED
PORT=5000
```

Initialize the database tables and seed categories:
```bash
cd server
node initDb.js
```

### 2. Run Backend
```bash
cd server
npm install
npm start
```
The server runs on `http://localhost:5000`.

### 3. Run Frontend
```bash
cd client
npm install
npm run dev
```
The client runs on `http://localhost:5173`.

---

## Deployment Instructions

### Render (Backend API)
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables in Render:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `DB_SSL`: `REQUIRED`
   - `NODE_ENV`: `production`

### Vercel (Frontend)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `client`.
3. Framework Preset: **Vite**.
4. Configure Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
5. Deploy.

---

## Live Production URLs

* **Frontend (Vercel):** [https://expense-tracker-ismail-fff6.vercel.app](https://expense-tracker-ismail-fff6.vercel.app)
* **Backend API (Render):** [https://expense-tracker-x5of.onrender.com](https://expense-tracker-x5of.onrender.com)

