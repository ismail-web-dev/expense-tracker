import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function EditExpense() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cats, expense] = await Promise.all([
          api.getCategories(),
          api.getExpenseById(id)
        ]);

        setCategories(cats);
        setAmount(expense.amount.toString());
        setCategoryId(expense.category_id.toString());
        setDescription(expense.description);
        setExpenseDate(expense.expense_date);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load expense details');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be a valid number greater than 0');
      return;
    }

    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!expenseDate) {
      setError('Date is required');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateExpense(id, {
        amount: parsedAmount,
        category_id: parseInt(categoryId, 10),
        description: description.trim(),
        expense_date: expenseDate
      });
      navigate('/expenses');
    } catch (err) {
      setError(err.message || 'Failed to update expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading-indicator">Loading expense details...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Edit Expense</h1>
      </div>

      <div className="form-container">
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-amount" className="form-label">
              Amount ($) *
            </label>
            <input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-category" className="form-label">
              Category *
            </label>
            <select
              id="edit-category"
              required
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="edit-description" className="form-label">
              Description *
            </label>
            <input
              id="edit-description"
              type="text"
              required
              className="form-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-date" className="form-label">
              Date *
            </label>
            <input
              id="edit-date"
              type="date"
              required
              className="form-input"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting ? 'Saving...' : 'Update Expense'}
            </button>
            <Link to="/expenses" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
