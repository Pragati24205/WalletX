// frontend/src/components/TransactionImportModal.jsx
import React, { useState } from 'react';
import api from '../api';

/**
 Props:
 - open: boolean
 - onClose(): called when modal closes
 - onImported({ transaction, addedExpense, newBalance }): callback to let parent update UI
 - userId: optional (current user id)
*/
export default function TransactionImportModal({ open, onClose, onImported, userId }) {
  const [text, setText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  if (!open) return null;

  async function handleParse() {
    setError(null);
    setParsed(null);
    if (!text.trim()) {
      setError('Paste the SMS/notification text first.');
      return;
    }
    setParsing(true);
    try {
      const res = await api.post('/transactions/parse', { text, userId });
      // backend returns either parsed object or success true
      setParsed(res);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (!parsed) {
      setError('Parse the text first.');
      return;
    }
    setImporting(true);
    setError(null);
    try {
      // If backend already added tx & expense (as in the provided backend), parsed contains transaction, newBalance, addedExpense
      // But to be defensive, call the same endpoint again to ensure state changes (idempotency: backend may dedupe)
      const res = await api.post('/transactions/parse', { text, userId });
      if (onImported) onImported(res);
      // clear & close
      setText('');
      setParsed(null);
      onClose();
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setImporting(false);
    }
  }

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Import transaction</h3>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={{ marginBottom: 10, color: '#6b7280' }}>
          Paste the SMS/notification text below — the app will try to detect amount and whether it was debited or credited.
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="E.g. Your account XXXXX1234 has been debited by ₹1,234.50 at AMAZON. Avl bal: ₹5,000."
          style={styles.textarea}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button onClick={handleParse} disabled={parsing} style={styles.ghostBtn}>
            {parsing ? 'Parsing…' : 'Parse'}
          </button>

          <button
            onClick={handleImport}
            disabled={importing || !parsed}
            style={styles.primaryBtn}
          >
            {importing ? 'Importing…' : 'Import transaction'}
          </button>

          <button onClick={() => { setText(''); setParsed(null); setError(null); }} style={styles.linkBtn}>
            Clear
          </button>
        </div>

        {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

        {parsed && (
          <div style={{ marginTop: 14, background: 'white', padding: 12, borderRadius: 10, boxShadow: '0 6px 16px rgba(2,6,23,0.04)' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Parsed result</div>

            <div style={{ display: 'grid', gap: 8 }}>
              <div><strong>Amount:</strong> {parsed.transaction?.amount ?? (parsed.parsed?.amount ?? 'Unknown')}</div>
              <div><strong>Type:</strong> {parsed.transaction?.type ?? parsed.parsed?.direction ?? 'Unknown'}</div>
              <div><strong>Description:</strong> {parsed.transaction?.description ?? parsed.parsed?.description ?? '—'}</div>
              <div><strong>Raw:</strong> <span style={{ color: '#6b7280' }}>{(parsed.transaction?.rawText ?? parsed.parsed?.rawText ?? '').slice(0, 220)}</span></div>
              {parsed.newBalance != null && <div><strong>New balance:</strong> {parsed.newBalance}</div>}
              {parsed.addedExpense && <div><strong>Expense added:</strong> {parsed.addedExpense.title} • ${parsed.addedExpense.amount}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.40)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16
  },
  modal: {
    width: '94%', maxWidth: 720, background: 'linear-gradient(180deg,#fbfdff,#ffffff)', borderRadius: 12, padding: 18, boxShadow: '0 20px 50px rgba(2,6,23,0.3)'
  },
  closeBtn: { background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' },
  textarea: { width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e6edf3', fontSize: 14, resize: 'vertical' },
  ghostBtn: { padding: '10px 14px', borderRadius: 10, border: '1px solid #e6edf3', background: 'white', cursor: 'pointer' },
  primaryBtn: { padding: '10px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,var(--purple),var(--blue))', color: 'white', cursor: 'pointer' },
  linkBtn: { padding: '10px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: '#6b7280', cursor: 'pointer' }
};
