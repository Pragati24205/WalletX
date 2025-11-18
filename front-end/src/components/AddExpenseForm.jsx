// frontend/src/components/AddExpenseForm.jsx
import React, { useState } from 'react';
import api from '../api';

export default function AddExpenseForm({ onBack, onSaved }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ['Food','Transport','Entertainment','Bills','Health','Other'];

  async function handleSave(e) {
    e.preventDefault();
    setError(null);

    if (!title || !amount || !category) {
      setError('Please fill title, amount and category.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        amount: parseFloat(amount).toFixed(2),
        category,
        date,
      };

      const created = await api.post('/expenses', payload);

      setTitle('');
      setAmount('');
      setCategory('');
      setLoading(false);

      onSaved && onSaved(created);
    } catch (err) {
      setLoading(false);
      setError(err.message || String(err));
    }
  }

  return (
    <div className="section" style={{ paddingBottom: 40 }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: "white",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          cursor: "pointer",
          color: "var(--purple)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          transition: "0.2s",
          marginBottom: 16
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f3ff")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
      >
        ←
      </button>

      <h2>Add Expense</h2>
      <p style={{ color: "#6b7280", marginBottom: 12 }}>
        Track your spending and stay financially aware.
      </p>

      <form
        onSubmit={handleSave}
        style={{ display: "grid", gap: 16, marginTop: 4 }}
      >

        {/* Title */}
        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Expense Title</div>
          <input
            className="input"
            placeholder="e.g., Grocery shopping"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10, borderRadius: 10 }}
          />
        </label>

        {/* Amount */}
        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Amount</div>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: 10, borderRadius: 10 }}
          />
        </label>

        {/* Category */}
        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Category</div>
          <select
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: 10, borderRadius: 10 }}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        {/* Date */}
        <label>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Date</div>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ padding: 10, borderRadius: 10 }}
          />
        </label>

        {/* Error message */}
        {error && (
          <div style={{ color: "red", fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={loading}
          className="onboard-btn"
          style={{
            borderRadius: 12,
            padding: "12px 16px",
            fontWeight: 600,
            background: "linear-gradient(90deg,var(--purple),var(--blue))",
            color: "white",
            border: "none",
            cursor: "pointer",
            transition: "0.2s",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Saving…" : "Save Expense"}
        </button>
      </form>
    </div>
  );
}
