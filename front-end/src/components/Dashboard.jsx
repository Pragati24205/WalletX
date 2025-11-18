// src/components/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import Card from './Card';
import NavBar from './NavBar';
import AnalyticsView from './AnalyticsView';
import AddExpenseForm from './AddExpenseForm';
import GamifiedLessonItem from './GamifiedLessonItem';
import LessonDetail from './LessonDetail';
import AchievementsView from './AchievementsView';
import { ExpenseIcon } from './Icons';
import api from '../api';
import ProfileSettings from "./ProfileSettings";
import ChangePassword from "./ChangePassword";
import TransactionImportModal from './TransactionImportModal';

export default function Dashboard({ user: initialUser }) {
  // core state
  const [user, setUser] = useState(initialUser || null);
  const [expenses, setExpenses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [community, setCommunity] = useState([]);
  const [openLessonId, setOpenLessonId] = useState(null);

  // UI state
  const [activeTab, setActiveTab] = useState('home'); // home | expenses | lessons | community | profile
  const [expensesView, setExpensesView] = useState('list'); // list | analytics | add
  const [showAddPost, setShowAddPost] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // profile edit / change password
  const [editMode, setEditMode] = useState(null); // null | 'profile' | 'password'
  const [showAchievementsInProfile, setShowAchievementsInProfile] = useState(false);

  // leaderboard
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardErr, setLeaderboardErr] = useState(null);

  // --------------------------
  // load data
  // --------------------------
  useEffect(() => {
    async function load() {
      try {
        const [e, l, c, prof] = await Promise.allSettled([
          api.get('/expenses'),
          api.get('/lessons'),
          api.get('/community'),
          api.get('/profile').catch(() => null),
        ]);

        if (e.status === 'fulfilled') setExpenses(e.value || []);
        if (c.status === 'fulfilled') setCommunity(c.value || []);

        // lessons: normalize defaults and ensure first lesson unlocked by default
        let lessonsRaw = (l.status === 'fulfilled' ? (l.value || []) : []);
        lessonsRaw = lessonsRaw.map((it, idx) => ({
          xp: it.xp ?? 100,
          progress: it.progress ?? 0,
          locked: typeof it.locked === 'boolean' ? it.locked : (idx === 0 ? false : true),
          ...it,
        }));
        // If none explicitly unlocked, ensure first open
        if (!lessonsRaw.some(x => !x.locked) && lessonsRaw.length) lessonsRaw[0].locked = false;
        setLessons(lessonsRaw);

        if (prof.status === 'fulfilled' && prof.value) {
          // ensure user contains profile data
          setUser(prev => ({ ...(prev || {}), ...prof.value }));
        }
      } catch (err) {
        console.error('Failed loading dashboard data', err);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------------------------
  // helpers
  // --------------------------
  function getDisplayName(u) {
    if (!u) return 'User';
    if (u.name && String(u.name).trim()) return u.name;
    if (u.email) return String(u.email).split('@')[0];
    return 'User';
  }

  function Avatar({ user: u, size = 72 }) {
    const initials = (getDisplayName(u)[0] || 'U').toUpperCase();
    const avatarStyle = {
      width: size,
      height: size,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg,#7c3aed,#60a5fa)',
      color: 'white',
      fontWeight: 700,
      fontSize: Math.round(size / 2.6),
    };
    return (
      <div style={{ padding: 4, borderRadius: '50%', background: 'linear-gradient(90deg, rgba(124,58,237,0.12), rgba(96,165,250,0.12))' }}>
        <div style={avatarStyle}>{initials}</div>
      </div>
    );
  }

  function groupExpensesByDate(list) {
    const map = {};
    (list || []).forEach(e => {
      const key = e.date ? String(e.date).slice(0, 10) : 'unknown';
      (map[key] ||= []).push(e);
    });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }

  function formatDateHeader(iso) {
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return iso;
      return d.toLocaleString('default', { month: 'short' }) + ' ' + d.getDate();
    } catch {
      return iso;
    }
  }

  // --------------------------
  // Lesson flows: open lesson and handle quiz result
  // --------------------------
  function handleStartLesson(lesson) {
    if (lesson?.locked) return;
    setOpenLessonId(lesson.id);
  }

  // when quiz returns a result (from LessonDetail -> Quiz -> backend)
  // result: { passed, pointsEarned, updatedLesson }
  function handleLessonResult(result) {
    if (!result) return;
    const updated = result.updatedLesson;
    setLessons(prev => {
      if (!updated) return prev;
      // update the specific lesson with new fields
      const copy = prev.map(l => (l.id === updated.id ? { ...l, ...updated } : l));
      // if passed, unlock next lesson
      if (result.passed) {
        const idx = copy.findIndex(x => x.id === updated.id);
        if (idx !== -1 && idx + 1 < copy.length) {
          copy[idx + 1] = { ...copy[idx + 1], locked: false };
        }
      }
      return copy;
    });

    // update user points if available in result (newPointsTotal)
    if (result.newPointsTotal != null) {
      setUser(prev => ({ ...(prev || {}), points: result.newPointsTotal }));
    }

    // optionally refresh achievements or leaderboard
    api.get('/achievements').catch(() => {});
  }

  // --------------------------
  // Leaderboard
  // --------------------------
  async function loadLeaderboard() {
    if (leaderboard || loadingLeaderboard) return;
    setLoadingLeaderboard(true);
    setLeaderboardErr(null);
    try {
      const res = await api.get('/leaderboard'); // optional server endpoint
      if (Array.isArray(res)) {
        // sort descending
        res.sort((a, b) => (b.points || 0) - (a.points || 0));
        setLeaderboard(res.map((u, i) => ({ ...u, rank: i + 1 })));
      } else {
        throw new Error('unexpected leaderboard response');
      }
    } catch (err) {
      // fallback demo list
      const demo = [
        { name: 'Aisha', points: 320 },
        { name: 'Ravi', points: 280 },
        { name: user?.name || 'You', points: (user?.points || 150) },
        { name: 'Sam', points: 120 },
        { name: 'Nina', points: 90 },
      ];
      demo.sort((a, b) => b.points - a.points);
      setLeaderboard(demo.map((u, i) => ({ ...u, rank: i + 1 })));
      setLeaderboardErr(String(err?.message || 'Using fallback leaderboard'));
    } finally {
      setLoadingLeaderboard(false);
    }
  }

  function openLeaderboard() {
    setShowLeaderboard(true);
    loadLeaderboard();
  }
  function closeLeaderboard() {
    setShowLeaderboard(false);
  }

  // --------------------------
  // Add post modal (inline component)
  // --------------------------
  function AddPostModal({ onClose }) {
    const [author, setAuthor] = useState(getDisplayName(user));
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);

    async function submit() {
      if (!text.trim()) return alert('Write something first.');
      setLoading(true);
      try {
        const payload = {
          author: author || 'Anonymous',
          text: text.trim(),
          initial: (author || 'A').charAt(0).toUpperCase(),
          time: 'just now',
        };
        const created = await api.post('/community', payload);
        setCommunity(prev => [created, ...prev]);
        onClose();
      } catch (err) {
        console.error(err);
        alert('Failed to add post');
      } finally {
        setLoading(false);
      }
    }

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2200 }}>
        <div style={{ width: '94%', maxWidth: 520, background: 'white', borderRadius: 12, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Create Post</h3>
            <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20 }}>✕</button>
          </div>

          <input placeholder="Your name" value={author} onChange={e => setAuthor(e.target.value)} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #e6edf3', marginBottom: 10 }} />
          <textarea placeholder="Share something..." value={text} onChange={e => setText(e.target.value)} rows={5} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #e6edf3', resize: 'vertical' }} />

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10 }}>Cancel</button>
            <button onClick={submit} disabled={loading} style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: 'linear-gradient(90deg,var(--purple),var(--blue))', color: 'white' }}>
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------
  // Transaction import integration
  // --------------------------
  function handleImportedTransaction(res) {
    // res expected: { addedExpense, newBalance, transaction, parsed }
    if (!res) return;
    if (res.addedExpense) {
      setExpenses(prev => [res.addedExpense, ...prev]);
    }
    if (res.newBalance != null) {
      setUser(prev => ({ ...(prev || {}), balance: res.newBalance }));
    }
    // refresh achievements
    api.get('/achievements').catch(() => {});
  }

  // --------------------------
  // Pages
  // --------------------------
  const HomePage = () => {
    const name = getDisplayName(user);
    return (
      <div className="page page--fade" style={{ padding: 26 }}>
        <div className="home-glass-wrap">
          <div className="home-glass">
            <div className="hero-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <Avatar user={user} />
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--purple)' }}>
                    Welcome, {name}!
                  </div>
                  <div style={{ color: '#6b7280', fontSize: 15 }}>How are you doing today? Small steps add up. 🌱</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className="glass-ghost" onClick={() => setActiveTab('expenses')}>View Expenses</button>
                <button className="glass-primary" onClick={() => setActiveTab('lessons')}>Start Lesson</button>
                <button onClick={() => setShowImportModal(true)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid #e6edf3', background: 'white' }}>Import SMS</button>
              </div>
            </div>

            <div className="stats-glass" style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 16 }}>
              <div className="stat-item">
                <div className="stat-label">Balance</div>
                <div className="stat-value">${(user?.balance ?? 2450).toLocaleString()}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Spending</div>
                <div className="stat-value" style={{ color: '#10b981' }}>$312</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Points</div>
                <div className="stat-value" style={{ color: 'var(--purple)' }}>{user?.points ?? 150}</div>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ fontSize: 13, color: '#6b7280' }}>Tip: Try logging one expense today</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ExpensesPage = () => {
    if (expensesView === 'analytics') return <AnalyticsView onBack={() => setExpensesView('list')} />;
    if (expensesView === 'add') {
      return <AddExpenseForm onBack={() => setExpensesView('list')} onSaved={(created) => { setExpenses(prev => [created, ...prev]); setExpensesView('list'); }} />;
    }

    const grouped = groupExpensesByDate(expenses);
    return (
      <div className="page page--fade">
        <section className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Expenses</h3>
              <div style={{ color: '#6b7280' }}>Track your spending</div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setExpensesView('analytics')} style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #ddd' }}>View Analytics</button>
              <button onClick={() => setExpensesView('add')} style={{ padding: '10px 18px', borderRadius: 22, background: 'linear-gradient(90deg,var(--purple),var(--blue))', color: 'white', border: 'none' }}>+ Add Expense</button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            {grouped.length === 0 ? <div style={{ color: '#6b7280' }}>No expenses yet — add one!</div> : grouped.map(([date, list]) => (
              <div key={date}>
                <div style={{ margin: '10px 0', color: '#6b7280' }}>{formatDateHeader(date)}</div>
                {list.map(e => (
                  <div key={e.id} className="expense-row" style={{ padding: 12, background: 'white', borderRadius: 10, display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ExpenseIcon /></div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{e.title}</div>
                        <div style={{ color: '#9ca3af', fontSize: 13 }}>{e.category}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>${e.amount}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // --------------------------
  // Lessons page (full function)
  // --------------------------
  const LessonsPage = () => {
    // local state inside this page
    const [localLessons, setLocalLessons] = useState(lessons);

    // keep localLessons synced when global lessons change
    useEffect(() => {
      setLocalLessons(lessons);
    }, [lessons]);

    return (
      <div className="page page--fade">
        <section className="section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h3 style={{ margin: 0 }}>Learn & Grow</h3>
              <div style={{ color: '#6b7280', marginTop: 6, fontSize: 13 }}>Complete lessons to earn points and unlock next modules</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div role="button" tabIndex={0} onClick={openLeaderboard} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openLeaderboard(); }}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(96,165,250,0.08))', cursor: 'pointer', boxShadow: '0 6px 18px rgba(99,102,241,0.06)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(90deg,var(--purple),var(--blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>🌟</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>Leaderboard</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Top ranks</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {(localLessons || []).map((l, idx) => {
              const isLocked = Boolean(l.locked);
              const lessonIdStr = String(l.id);
              const progress = Number(l.progress || 0);

              return (
                <div key={lessonIdStr}
                  role={isLocked ? 'article' : 'button'}
                  tabIndex={isLocked ? -1 : 0}
                  onClick={() => { if (!isLocked) handleStartLesson(l); }}
                  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !isLocked) { e.preventDefault(); handleStartLesson(l); } }}
                  style={{ cursor: isLocked ? 'not-allowed' : 'pointer', opacity: isLocked ? 0.78 : 1, transition: 'transform 0.12s ease, box-shadow 0.12s ease' }}
                  aria-disabled={isLocked}
                  aria-label={`${l.title} ${isLocked ? 'locked' : `progress ${progress}%`}`}
                >
                  <GamifiedLessonItem lesson={l} onStart={() => { if (!isLocked) handleStartLesson(l); }} />
                </div>
              );
            })}
          </div>
        </section>

        {/* Leaderboard modal */}
        {showLeaderboard && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: 16 }}>
            <div style={{ width: '100%', maxWidth: 720, background: 'white', borderRadius: 12, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0 }}>Leaderboard</h3>
                  <div style={{ color: '#6b7280', fontSize: 13 }}>Top users by points</div>
                </div>
                <div>
                  <button onClick={closeLeaderboard} style={{ padding: 8, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer' }}>Close</button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                {(leaderboard || []).map((u, i) => (
                  <div key={u.name + i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, background: i === 0 ? 'linear-gradient(90deg, rgba(124,58,237,0.06), rgba(96,165,250,0.06))' : 'white', borderRadius: 10 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: i === 0 ? 'linear-gradient(90deg,var(--purple),var(--blue))' : '#eef2ff', color: i === 0 ? 'white' : '#7c3aed', fontWeight: 700 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name === (user?.name) ? `${u.name} (You)` : u.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>{u.tag || ''}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: 'var(--purple)' }}>{u.points} pts</div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>{u.rank ? `Rank ${u.rank}` : ''}</div>
                    </div>
                  </div>
                ))}

                {(!leaderboard || leaderboard.length === 0) && !loadingLeaderboard && <div style={{ color: '#6b7280' }}>No leaderboard data available.</div>}
                {leaderboardErr && <div style={{ color: '#f97316' }}>{leaderboardErr}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const CommunityPage = () => (
    <div className="page page--fade">
      <section className="section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Community</h3>
          <button onClick={() => setShowAddPost(true)} style={{ padding: '8px 14px', background: 'linear-gradient(90deg,var(--purple),var(--blue))', borderRadius: 22, border: 'none', color: 'white', fontWeight: 700 }}>+ Add Post</button>
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {community.map(c => (
            <div key={c.id} style={{ background: 'white', padding: 12, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(90deg,var(--purple),var(--blue))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {c.initial || (c.author || 'A').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.author} <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: 12 }}>• {c.time}</span></div>
                <div style={{ marginTop: 6, color: '#374151' }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // --------------------------
  // Profile & editing pages
  // --------------------------
  const EditProfilePage = () => {
    const [username, setUsername] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [saving, setSaving] = useState(false);

    async function save() {
      setSaving(true);
      try {
        // try backend update if available
        await api.put('/profile', { username, email }).catch(() => {});
        setUser(prev => ({ ...(prev || {}), name: username, email }));
        setEditMode(null);
      } catch (err) {
        alert('Failed to save profile');
      } finally {
        setSaving(false);
      }
    }

    return (
      <div className="page page--fade">
        <section className="section">
          <button onClick={() => setEditMode(null)} style={{ background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', fontSize: 20, cursor: 'pointer', color: 'var(--purple)', marginBottom: 16 }}>←</button>
          <h3>Edit Profile</h3>

          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <label><div style={{ fontWeight: 600 }}>Username</div><input className="input" value={username} onChange={e => setUsername(e.target.value)} /></label>
            <label><div style={{ fontWeight: 600 }}>Email</div><input className="input" value={email} onChange={e => setEmail(e.target.value)} /></label>

            <button onClick={save} className="onboard-btn" style={{ borderRadius: 12 }}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </section>
      </div>
    );
  };

  const ChangePasswordPage = () => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirm, setConfirm] = useState('');
    const [saving, setSaving] = useState(false);

    async function save() {
      if (newPass !== confirm) return alert('Passwords do not match!');
      setSaving(true);
      try {
        await api.put('/profile/password', { currentPassword: oldPass, newPassword: newPass }).catch(() => {});
        alert('Password changed (demo)');
        setEditMode(null);
      } catch (err) {
        alert('Failed to change password');
      } finally {
        setSaving(false);
      }
    }

    return (
      <div className="page page--fade">
        <section className="section">
          <button onClick={() => setEditMode(null)} style={{ background: 'white', border: 'none', borderRadius: '50%', width: 40, height: 40, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', fontSize: 20, cursor: 'pointer', color: 'var(--purple)', marginBottom: 16 }}>←</button>
          <h3>Change Password</h3>

          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <label><div style={{ fontWeight: 600 }}>Old Password</div><input className="input" type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} /></label>
            <label><div style={{ fontWeight: 600 }}>New Password</div><input className="input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} /></label>
            <label><div style={{ fontWeight: 600 }}>Confirm Password</div><input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} /></label>

            <button onClick={save} className="onboard-btn" style={{ borderRadius: 12 }}>{saving ? 'Updating…' : 'Update Password'}</button>
          </div>
        </section>
      </div>
    );
  };

  const ProfilePage = () => {
    if (showAchievementsInProfile) return <AchievementsView onBack={() => setShowAchievementsInProfile(false)} />;
    if (editMode === 'profile') return <EditProfilePage />;
    if (editMode === 'password') return <ChangePasswordPage />;

    return (
      <div className="page page--fade">
        <section className="section">
          <h3>Profile</h3>
          <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
            <Avatar user={user} size={72} />
            <div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Username</div>
              <div style={{ fontWeight: 700 }}>{getDisplayName(user)}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>Email</div>
              <div style={{ fontWeight: 700 }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <button onClick={() => setEditMode('profile')} style={{ padding: 10, borderRadius: 10 }}>Edit Profile</button>
            <button onClick={() => setEditMode('password')} style={{ padding: 10, borderRadius: 10 }}>Change Password</button>
            <button onClick={() => setShowAchievementsInProfile(true)} style={{ padding: 10, borderRadius: 10, background: 'linear-gradient(90deg,var(--purple),var(--blue))', color: 'white', border: 'none' }}>View Achievements</button>
          </div>
        </section>
      </div>
    );
  };

  // --------------------------
  // Main render
  // --------------------------
  return (
    <div className="dash-root" style={{ paddingBottom: 120 }}>
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'expenses' && <ExpensesPage />}

      {activeTab === 'lessons' && (openLessonId ? (
        <LessonDetail
          lessonId={openLessonId}
          onClose={() => setOpenLessonId(null)}
          onCompleted={(result) => {
            handleLessonResult(result);
            if (result?.passed) setOpenLessonId(null);
          }}
        />
      ) : <LessonsPage />)}

      {activeTab === 'community' && <CommunityPage />}
      {activeTab === 'profile' && <ProfilePage />}

      {/* Add Post Modal */}
      {showAddPost && <AddPostModal onClose={() => setShowAddPost(false)} />}

      {/* Transaction import modal */}
      {showImportModal && <TransactionImportModal open={showImportModal} onClose={() => setShowImportModal(false)} userId={user?.id} onImported={handleImportedTransaction} />}

      {/* Leaderboard modal (kept inside lessons page too) */}
      {/* Navigation */}
      <NavBar active={activeTab} onChange={(tab) => { setActiveTab(tab); if (tab === 'expenses') setExpensesView('list'); }} />
    </div>
  );
}
