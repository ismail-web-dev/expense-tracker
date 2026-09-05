const express = require('express');
const router = express.Router();
const {
  getCategories,
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getDashboard
} = require('../controllers/expenseController');

// Categories route
router.get('/categories', getCategories);

// Dashboard route
router.get('/dashboard', getDashboard);

// Expenses routes
router.get('/expenses', getExpenses);
router.get('/expenses/:id', getExpenseById);
router.post('/expenses', createExpense);
router.put('/expenses/:id', updateExpense);
router.delete('/expenses/:id', deleteExpense);

module.exports = router;
