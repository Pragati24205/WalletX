// server.js
// =========================
//  Financial App Backend
// =========================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

// Import in-memory data (sampleExpenses, lessons, communityPosts, users)
// Use `let` so we can mutate arrays (unshift/splice) safely
let { sampleExpenses, lessons, communityPosts, users } = require('./data');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// -------------------------
// AUTH (simple demo)
// -------------------------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Missing credentials');

  let user = users.find(u => u.email === email);

  if (!user) {
    user = { id: Date.now(), name: email.split('@')[0], email, points: 0 };
    users.push(user);
  }

  res.cookie('sid', 'demo-session', { httpOnly: true });
  res.json({ user });
});

app.post('/api/auth/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).send('Missing fields');

  const user = { id: Date.now(), name, email, points: 0 };
  users.push(user);

  res.cookie('sid', 'demo-session', { httpOnly: true });
  res.json({ user });
});

// -------------------------
// EXPENSE ROUTES
// -------------------------
app.get('/api/expenses', (req, res) => {
  res.json(sampleExpenses);
});

app.post('/api/expenses', (req, res) => {
  const item = req.body;

  if (!item || !item.title || !item.amount) {
    return res.status(400).json({ error: "Missing title or amount" });
  }

  item.id = Date.now();
  item.date = item.date || new Date().toISOString().slice(0, 10);
  item.category = item.category || "Other";

  // ensure sampleExpenses is an array
  if (!Array.isArray(sampleExpenses)) sampleExpenses = [];
  sampleExpenses.unshift(item);
  res.json(item);
});

app.delete('/api/expenses/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = sampleExpenses.findIndex(e => e.id === id);
  if (idx === -1) return res.status(404).send("Not found");

  sampleExpenses.splice(idx, 1);
  res.json({ ok: true });
});

// -------------------------
// ANALYTICS
// -------------------------
app.get('/api/analytics', (req, res) => {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const thisMonth = Array.isArray(sampleExpenses)
    ? sampleExpenses.filter(e => e.date && String(e.date).startsWith(monthPrefix))
    : [];

  const totalMonthlySpending = thisMonth.reduce((sum, it) => sum + (parseFloat(it.amount) || 0), 0);

  const spendingByCategory = {};
  thisMonth.forEach(it => {
    const cat = it.category || 'Other';
    spendingByCategory[cat] = (spendingByCategory[cat] || 0) + (parseFloat(it.amount) || 0);
  });

  const categoryDistribution = Object.keys(spendingByCategory)
    .map(cat => ({ category: cat, amount: spendingByCategory[cat] }))
    .sort((a, b) => b.amount - a.amount);

  res.json({
    totalMonthlySpending,
    monthLabel: `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`,
    spendingByCategory,
    categoryDistribution
  });
});

// -------------------------
// LESSONS & COMMUNITY
// -------------------------
app.get('/api/lessons', (req, res) => res.json(lessons));

app.get('/api/community', (req, res) => res.json(communityPosts));

app.post('/api/community', (req, res) => {
  const post = req.body || {};
  post.id = Date.now();
  post.time = post.time || 'just now';
  post.initial = post.initial || (post.author ? post.author.charAt(0).toUpperCase() : 'A');
  communityPosts.unshift(post);
  res.json(post);
});

// -------------------------
// ACHIEVEMENTS
// -------------------------
app.get('/api/achievements', (req, res) => {
  const totalExpensesCount = Array.isArray(sampleExpenses) ? sampleExpenses.length : 0;
  const totalSpent = (Array.isArray(sampleExpenses) ? sampleExpenses : []).reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

  const days = new Set((Array.isArray(sampleExpenses) ? sampleExpenses : []).map(e =>
    e.date || new Date(Number(e.id) || 0).toISOString().slice(0, 10)
  ));

  const completedLessons = Array.isArray(lessons) ? lessons.filter(l => (l.progress || 0) >= 100).length : 0;

  const badges = [
    {
      id: 'tracker-master',
      title: 'Tracker Master',
      description: 'Record 10 expenses',
      earned: totalExpensesCount >= 10,
      progress: Math.min(100, Math.round((totalExpensesCount / 10) * 100)),
      icon: '📒'
    },
    {
      id: 'smart-saver',
      title: 'Smart Saver',
      description: 'Spend less than $500 total',
      earned: totalSpent <= 500,
      progress: Math.max(0, Math.round(((500 - totalSpent) / 500) * 100)),
      icon: '💡'
    },
    {
      id: 'consistent',
      title: 'Consistent Tracker',
      description: 'Record expenses on 3 different days',
      earned: days.size >= 3,
      progress: Math.min(100, Math.round((days.size / 3) * 100)),
      icon: '📅'
    },
    {
      id: 'lesson-master',
      title: 'Lesson Master',
      description: 'Complete all lessons',
      earned: Array.isArray(lessons) && lessons.length > 0 ? (completedLessons >= lessons.length) : false,
      progress: Array.isArray(lessons) && lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0,
      icon: '🏅'
    }
  ];

  const points = (completedLessons * 50) + Math.floor(totalExpensesCount / 2) * 5;

  res.json({
    points,
    summary: {
      totalExpensesCount,
      totalSpent,
      daysCount: days.size,
      completedLessons,
      totalLessons: Array.isArray(lessons) ? lessons.length : 0,
    },
    badges
  });
});

// -------------------------
// QUIZ SYSTEM
// -------------------------
const QUIZ_ANSWERS = {
  "understanding-credit": [1, 1, 1],
  "budgeting-basics": [1, 1],
  "saving-strategies": [1, 1]
};

app.post('/api/quiz/submit', (req, res) => {
  const { userId = 1, lessonId, answers } = req.body || {};

  if (!lessonId || !Array.isArray(answers)) return res.status(400).json({ error: "Missing lessonId or answers" });

  const correct = QUIZ_ANSWERS[lessonId];
  if (!correct) return res.status(400).json({ error: "Quiz not found" });

  let correctCount = 0;
  for (let i = 0; i < correct.length; i++) {
    if (answers[i] === correct[i]) correctCount++;
  }

  const passed = (correctCount / correct.length) * 100 >= 60;
  const pointsEarned = passed ? correctCount * 10 : 0;

  const user = (Array.isArray(users) ? users : []).find(u => u.id === Number(userId));
  if (user) user.points = (user.points || 0) + pointsEarned;

  const lesson = (Array.isArray(lessons) ? lessons : []).find(l => l.id === lessonId);
  if (lesson) {
    lesson.progress = passed ? 100 : Math.round((correctCount / correct.length) * 100);
    if (passed) lesson.locked = false;
  }

  res.json({
    correctCount,
    total: correct.length,
    passed,
    pointsEarned,
    updatedLesson: lesson || null,
    newPointsTotal: user ? user.points : null
  });
});

// -------------------------
// PROFILE ROUTES
// -------------------------
app.get('/api/profile', (req, res) => {
  const user = Array.isArray(users) && users.length ? users[0] : { id: 1, name: 'Pragati', email: 'pragati@example.com' };
  res.json({ username: user.name, email: user.email });
});

app.put('/api/profile', (req, res) => {
  const { username, email } = req.body || {};
  if (!username || !email) return res.status(400).json({ error: "Missing fields" });

  if (!Array.isArray(users) || !users.length) users = [{ id: 1, name: username, email, points: 0 }];
  const user = users[0];
  user.name = username;
  user.email = email;

  res.json({ success: true, user });
});

app.put('/api/profile/password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  // Demo backend: no password checks — accept anything for demo purposes
  res.json({ success: true, message: "Password updated (demo)" });
});
// POST /api/quiz/submit
app.post('/api/quiz/submit', (req, res) => {
  const { userId = 1, lessonId, answers } = req.body;

  const correct = QUIZ_ANSWERS[lessonId];
  if (!correct) return res.status(400).json({ error: "Quiz not found" });

  let correctCount = 0;
  for (let i = 0; i < correct.length; i++) {
    if (answers[i] === correct[i]) correctCount++;
  }
  const total = correct.length;
  const percent = (correctCount / total) * 100;
  const passed = percent >= 60;
  const pointsEarned = passed ? correctCount * 10 : 0;

  // update user points
  const user = users.find(u => u.id === Number(userId));
  if (user) user.points = (user.points || 0) + (passed ? pointsEarned : 0);

  // update the lesson
  const lessonIdx = lessons.findIndex(l => l.id === lessonId);
  const lesson = lessons[lessonIdx];
  if (lesson) {
    lesson.progress = passed ? 100 : Math.round(percent);
    lesson.locked = passed ? false : lesson.locked;

    // IMPORTANT: unlock the next lesson if passed
    if (passed && lessonIdx !== -1 && lessonIdx + 1 < lessons.length) {
      lessons[lessonIdx + 1].locked = false;
    }
  }

  res.json({
    correctCount,
    total,
    percent,
    passed,
    pointsEarned: passed ? pointsEarned : 0,
    newPointsTotal: user ? user.points : null,
    updatedLesson: lesson || null,
  });
});
// transactions.js
// Simple SMS/notification -> transaction parser + routes
// Usage: require('./transactions')(app, { users, transactionsArrayOptional })

module.exports = function registerTransactionRoutes(app, { users, sampleExpenses, transactions }) {
  // simple in-memory transactions store if not provided
  if (!Array.isArray(transactions)) transactions = [];

  // helper: parse amount from text (supports ₹, $, commas, decimals)
  function parseAmount(text) {
    if (!text) return null;
    // match currency symbol optionally, numbers with optional commas and decimals
    // examples matched: ₹1,234.50, Rs. 1200, $45.23, 1200.00
    const match = text.match(/(?:₹|Rs\.?|INR|\$)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/i);
    if (!match) return null;
    // remove commas then parse
    const number = parseFloat(match[1].replace(/,/g, ''));
    if (Number.isNaN(number)) return null;
    return number;
  }

  // helper: detect direction: debit or credit (fallback: unknown)
  function detectDirection(text) {
    if (!text) return 'unknown';
    const lower = text.toLowerCase();

    const debitKeywords = [
      'debited', 'debit', 'spent', 'purchase', 'payment', 'paid', 'withdrawal', 'withdrawn',
      'deducted', 'used', 'sent', 'charge', 'charged', 'sent to'
    ];
    const creditKeywords = [
      'credited', 'credit', 'received', 'deposit', 'refunded', 'refund', 'added', 'cashback',
      'benefit', 'credited to', 'credited into'
    ];

    for (const k of debitKeywords) if (lower.includes(k)) return 'debit';
    for (const k of creditKeywords) if (lower.includes(k)) return 'credit';
    return 'unknown';
  }

  // helper: short description extraction (merchant, or first few words)
  function extractDescription(text) {
    if (!text) return '';
    // try merchant pattern: "to <merchant>" or "at <merchant>" or "from <merchant>"
    const m = text.match(/\b(?:to|at|from|via)\s+([A-Za-z0-9 &\-\._\/]{2,40})/i);
    if (m && m[1]) return m[1].trim();
    // otherwise return first 6-10 words
    return text.split(/\s+/).slice(0, 8).join(' ').trim();
  }

  // POST /api/transactions/parse
  // body: { userId, text }
  app.post('/api/transactions/parse', (req, res) => {
    try {
      const { userId = null, text = '' } = req.body || {};

      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'Missing text to parse' });
      }

      const amount = parseAmount(text);
      const direction = detectDirection(text); // 'debit'|'credit'|'unknown'
      const description = extractDescription(text);

      if (amount == null) {
        // Return parse result but inform frontend amount unknown
        return res.status(200).json({
          parsed: { amount: null, direction, description },
          message: 'Could not parse an amount from text'
        });
      }

      // Build transaction object
      const tx = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        userId: userId,
        amount: Number(amount.toFixed(2)),
        type: direction === 'credit' ? 'credit' : (direction === 'debit' ? 'debit' : 'unknown'),
        description,
        rawText: text,
        date: new Date().toISOString()
      };

      // store transaction
      transactions.unshift(tx);

      // update user balance in-memory (demo)
      const user = (userId != null) ? users.find(u => Number(u.id) === Number(userId)) : users && users[0];
      // ensure user has numeric balance
      if (user) {
        if (typeof user.balance === 'undefined') user.balance = 0;
        if (tx.type === 'debit') {
          user.balance = Number((Number(user.balance) - tx.amount).toFixed(2));
        } else if (tx.type === 'credit') {
          user.balance = Number((Number(user.balance) + tx.amount).toFixed(2));
        }
      }

      // optionally also add to sampleExpenses (if debit) so expense list shows up
      if (tx.type === 'debit' && Array.isArray(sampleExpenses)) {
        sampleExpenses.unshift({
          id: Date.now() + Math.floor(Math.random() * 1000),
          title: description || 'Transaction',
          amount: tx.amount,
          category: 'Imported',
          date: new Date().toISOString().slice(0, 10)
        });
      }

      // return parsed result + updated state
      return res.json({
        success: true,
        transaction: tx,
        newBalance: user ? user.balance : null,
        addedExpense: tx.type === 'debit' ? sampleExpenses[0] : null
      });
    } catch (err) {
      console.error('Transaction parse error', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/transactions  -> returns parsed transactions (demo)
  app.get('/api/transactions', (req, res) => {
    res.json(transactions);
  });

  // Return reference to transactions so server can keep using it if needed
  return { transactions };
};
// --- Transaction parsing & import endpoints ---
// paste into your Express server file (after users, sampleExpenses, bodyParser, cors setup)

function parseAmountAndDirection(text) {
  if (!text || typeof text !== 'string') return null;

  // Normalize
  const t = text.replace(/\u00A0/g, ' '); // non-breaking spaces
  // Find amounts like ₹1,234.56 or Rs.1234 or $45.00 or 1234.50
  const moneyRegex = /(?:₹|Rs\.?|INR|\$|USD)?\s?([0-9]+(?:[.,][0-9]{2})?(?:,[0-9]{3})*)(?!\S)/g;
  let match;
  const amounts = [];
  while ((match = moneyRegex.exec(t)) !== null) {
    // convert "1,234.56" or "1.234,56" to number safely
    let raw = match[1];
    // remove thousands separators (commas)
    raw = raw.replace(/,/g, '');
    const num = parseFloat(raw.replace(',', '.'));
    if (!Number.isNaN(num)) amounts.push(num);
  }

  // heuristics for debit/credit
  const debitKeywords = ['debited', 'debit', 'spent', 'withdrawn', 'paid', 'purchase', 'sent'];
  const creditKeywords = ['credited', 'credit', 'received', 'deposit', 'refunded', 'cashback', 'paid to you'];

  const lower = t.toLowerCase();
  const isDebit = debitKeywords.some(k => lower.includes(k));
  const isCredit = creditKeywords.some(k => lower.includes(k));

  // fallback: if there's a "dr"/"cr" token like "DR" or "CR"
  if (!isDebit && !isCredit) {
    if (/\bdr\b/.test(lower) || /\bdebit\b/.test(lower)) return { amounts, direction: 'debit' };
    if (/\bcr\b/.test(lower) || /\bcredit\b/.test(lower)) return { amounts, direction: 'credit' };
  }

  let direction = 'unknown';
  if (isDebit && !isCredit) direction = 'debit';
  else if (isCredit && !isDebit) direction = 'credit';
  else if (isDebit && isCredit) direction = 'unknown';

  // choose most plausible amount: prefer the first one
  const amount = amounts.length ? amounts[0] : null;

  return { amounts, amount, direction };
}

// POST /api/transactions/parse
// body: { text: string, userId?: number }
app.post('/api/transactions/parse', (req, res) => {
  try {
    const { text = '', userId } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing text' });

    const parsed = parseAmountAndDirection(text);

    if (!parsed || parsed.amount == null) {
      return res.status(200).json({ ok: true, parsed, message: 'No amount detected' });
    }

    // find user (demo)
    let user = null;
    if (typeof userId !== 'undefined') user = users.find(u => u.id === Number(userId));
    if (!user) user = users[0]; // fallback to demo user

    // Make a transaction object
    const amount = Number(parsed.amount);
    const isDebit = parsed.direction === 'debit';
    const isCredit = parsed.direction === 'credit';

    const tx = {
      id: Date.now(),
      title: (isDebit ? 'Imported debit' : isCredit ? 'Imported credit' : 'Imported txn'),
      amount: (amount).toFixed(2),
      category: 'Imported',
      date: new Date().toISOString().slice(0, 10),
      rawText: text,
      direction: parsed.direction,
    };

    // Do not persist on parse endpoint — just return what we WOULD do.
    // For "import" endpoint below we persist to sampleExpenses and update user balance.
    return res.json({
      ok: true,
      parsed,
      simulatedTransaction: tx,
      currentBalance: user.balance ?? null,
    });
  } catch (err) {
    console.error('parse error', err);
    return res.status(500).json({ error: String(err) });
  }
});

// POST /api/transactions/import
// body: { text: string, userId?: number, persist?: true }
// This will parse and persist (add expense or credit) and update demo user's balance.
app.post('/api/transactions/import', (req, res) => {
  try {
    const { text = '', userId } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing text' });

    const parsed = parseAmountAndDirection(text);
    if (!parsed || parsed.amount == null) return res.status(400).json({ error: 'No amount found' });

    let user = null;
    if (typeof userId !== 'undefined') user = users.find(u => u.id === Number(userId));
    if (!user) user = users[0];

    const amount = Number(parsed.amount);
    const isDebit = parsed.direction === 'debit';
    const isCredit = parsed.direction === 'credit';

    // build item to add
    const item = {
      id: Date.now(),
      title: isDebit ? 'Imported: Debit' : isCredit ? 'Imported: Credit' : 'Imported: Transaction',
      amount: amount.toFixed(2),
      category: 'Imported',
      date: new Date().toISOString().slice(0, 10),
      rawText: text,
      direction: parsed.direction,
    };

    // Persist (for demo we push to sampleExpenses for debits only)
    if (isDebit) {
      if (!Array.isArray(sampleExpenses)) sampleExpenses = [];
      sampleExpenses.unshift(item);
      // subtract from user's balance if available
      if (typeof user.balance === 'number') user.balance = Number((user.balance - amount).toFixed(2));
    } else if (isCredit) {
      // treat credit as negative expense? For demo, update balance and optionally add a "negative expense"
      if (!Array.isArray(sampleExpenses)) sampleExpenses = [];
      // we will store credits too, but mark category
      const creditItem = { ...item, category: 'Imported Credit' };
      sampleExpenses.unshift(creditItem);
      if (typeof user.balance === 'number') user.balance = Number((user.balance + amount).toFixed(2));
    } else {
      // unknown direction: persist as imported (no balance change)
      sampleExpenses.unshift(item);
    }

    // Return created item and new balance
    return res.json({
      ok: true,
      addedExpense: item,
      parsed,
      newBalance: user.balance ?? null,
      user,
    });
  } catch (err) {
    console.error('import error', err);
    return res.status(500).json({ error: String(err) });
  }
});



// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
