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

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
