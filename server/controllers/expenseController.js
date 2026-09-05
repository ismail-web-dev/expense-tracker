const { pool, testConnection } = require('../config/db');

// GET /api/categories
async function getCategories(req, res) {
  try {
    const [rows] = await pool.query('SELECT id, name FROM categories ORDER BY id ASC');
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

// GET /api/expenses (supports ?category=Food)
async function getExpenses(req, res) {
  try {
    const { category } = req.query;
    let query = `
      SELECT e.id, e.amount, e.category_id, c.name AS category_name, e.description, 
             DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS expense_date, e.created_at
      FROM expenses e
      JOIN categories c ON e.category_id = c.id
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' WHERE c.name = ?';
      params.push(category);
    }

    query += ' ORDER BY e.expense_date DESC, e.id DESC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
}

// GET /api/expenses/:id
async function getExpenseById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const [rows] = await pool.query(
      `SELECT e.id, e.amount, e.category_id, c.name AS category_name, e.description, 
              DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS expense_date, e.created_at
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return res.status(500).json({ error: 'Failed to fetch expense' });
  }
}

// POST /api/expenses
async function createExpense(req, res) {
  try {
    const { amount, category_id, description, expense_date } = req.body;

    // Validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid number greater than zero' });
    }

    const parsedCategoryId = parseInt(category_id, 10);
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({ error: 'Valid category is required' });
    }

    // Verify category exists
    const [catRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [parsedCategoryId]);
    if (catRows.length === 0) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!expense_date || isNaN(Date.parse(expense_date))) {
      return res.status(400).json({ error: 'Valid expense date (YYYY-MM-DD) is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO expenses (amount, category_id, description, expense_date) VALUES (?, ?, ?, ?)',
      [parsedAmount, parsedCategoryId, description.trim(), expense_date]
    );

    const [newExpense] = await pool.query(
      `SELECT e.id, e.amount, e.category_id, c.name AS category_name, e.description, 
              DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS expense_date, e.created_at
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    return res.status(201).json(newExpense[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ error: 'Failed to create expense' });
  }
}

// PUT /api/expenses/:id
async function updateExpense(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const { amount, category_id, description, expense_date } = req.body;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a valid number greater than zero' });
    }

    const parsedCategoryId = parseInt(category_id, 10);
    if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({ error: 'Valid category is required' });
    }

    // Verify category exists
    const [catRows] = await pool.query('SELECT id FROM categories WHERE id = ?', [parsedCategoryId]);
    if (catRows.length === 0) {
      return res.status(400).json({ error: 'Selected category does not exist' });
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return res.status(400).json({ error: 'Description is required' });
    }

    if (!expense_date || isNaN(Date.parse(expense_date))) {
      return res.status(400).json({ error: 'Valid expense date (YYYY-MM-DD) is required' });
    }

    const [updateResult] = await pool.query(
      'UPDATE expenses SET amount = ?, category_id = ?, description = ?, expense_date = ? WHERE id = ?',
      [parsedAmount, parsedCategoryId, description.trim(), expense_date, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const [updatedExpense] = await pool.query(
      `SELECT e.id, e.amount, e.category_id, c.name AS category_name, e.description, 
              DATE_FORMAT(e.expense_date, '%Y-%m-%d') AS expense_date, e.created_at
       FROM expenses e
       JOIN categories c ON e.category_id = c.id
       WHERE e.id = ?`,
      [id]
    );

    return res.status(200).json(updatedExpense[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ error: 'Failed to update expense' });
  }
}

// DELETE /api/expenses/:id
async function deleteExpense(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Failed to delete expense' });
  }
}

// GET /api/dashboard
async function getDashboard(req, res) {
  try {
    // Total expenses amount & count
    const [overallRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) AS total_amount,
        COUNT(*) AS total_count
      FROM expenses
    `);

    // Current month total
    const [monthRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) AS current_month_total
      FROM expenses
      WHERE YEAR(expense_date) = YEAR(CURRENT_DATE())
        AND MONTH(expense_date) = MONTH(CURRENT_DATE())
    `);

    return res.status(200).json({
      total_amount: parseFloat(overallRows[0].total_amount),
      total_count: parseInt(overallRows[0].total_count, 10),
      current_month_total: parseFloat(monthRows[0].current_month_total)
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}

module.exports = {
  getCategories,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboard
};
