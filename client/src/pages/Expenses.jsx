import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Bills', 'Other'];

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = async (category) => {
    try {
      setLoading(true);
      const data = await api.getExpenses(category);
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses(selectedCategory);
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense?');
    if (!confirmed) return;

    try {
      await api.deleteExpense(id);
      // Remove from state immediately
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      alert(`Error deleting expense: ${err.message}`);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val || 0);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <Link to="/expenses/add" className="btn btn-primary">
          + Add Expense
        </Link>
      </div>

      {/* Category Filter Bar */}
      <div className="filter-bar">
        <label htmlFor="categoryFilter" className="filter-label">Filter by Category:</label>
        <select
          id="categoryFilter"
          className="filter-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="card empty-state">
          <p>No expenses found{selectedCategory !== 'All' ? ` for "${selectedCategory}"` : ''}.</p>
          <Link to="/expenses/add" className="btn btn-primary">
            Add Your First Expense
          </Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.expense_date}</td>
                  <td>
                    <span className="badge">{expense.category_name}</span>
                  </td>
                  <td>{expense.description}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(expense.amount)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <Link
                        to={`/expenses/edit/${expense.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
