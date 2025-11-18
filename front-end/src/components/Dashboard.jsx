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


export default function Dashboard({ user }) {
  const [expenses, setExpenses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [community, setCommunity] = useState([]);
  const [openLessonId, setOpenLessonId] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [editMode, setEditMode] = useState(null); 
// null | "profile" | "password"



  // Add community post modal
  const [showAddPost, setShowAddPost] = useState(false);

  // active tab
  const [activeTab, setActiveTab] = useState('home');

  // expenses view mode
  const [expensesView, setExpensesView] = useState('list');

  // achievements view inside profile
  const [showAchievementsInProfile, setShowAchievementsInProfile] = useState(false);

  // --------------------------
  // Load dashboard data
  // --------------------------
  useEffect(() => {
    async function load() {
      try {
        const [e, l, c] = await Promise.all([
          api.get('/expenses'),
          api.get('/lessons'),
          api.get('/community'),
        ]);

        setExpenses(e || []);

        setLessons((l || []).map(it => ({
          xp: it.xp ?? 100,
          progress: it.progress ?? 0,
          locked: it.locked ?? false,
          ...it,
        })));

        setCommunity(c || []);
      } catch (err) {
        console.error("Failed loading dashboard", err);
      }
    }
    load();
  }, []);

  // --------------------------
  // Helper: extract display name
  // --------------------------
  function getDisplayName(user) {
    if (!user) return "User";
    if (user.name && user.name.trim()) return user.name;
    if (user.email) return user.email.split("@")[0];
    return "User";
  }

  // --------------------------
  // Avatar component
  // --------------------------
  function Avatar({ user, size = 72 }) {
    const initials = (getDisplayName(user)[0] || 'U').toUpperCase();

    const avatarStyle = {
      width: size,
      height: size,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #7c3aed, #60a5fa)",
      color: "white",
      fontWeight: 700,
      fontSize: size / 2.3
    };

    return (
      <div style={{
        padding: 4,
        borderRadius: "50%",
        background: "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(96,165,250,0.15))",
      }}>
        <div style={avatarStyle}>{initials}</div>
      </div>
    );
  }

  // --------------------------
  // Helpers: group expenses
  // --------------------------
  function groupExpensesByDate(list) {
    const map = {};

    list.forEach(e => {
      const date = e.date ? e.date.slice(0, 10) : "unknown";
      if (!map[date]) map[date] = [];
      map[date].push(e);
    });

    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }

  function formatDateHeader(d) {
    const date = new Date(d);
    return date.toLocaleString("default", { month: "short" }) + " " + date.getDate();
  }

  // --------------------------
  // Lessons
  // --------------------------
  function handleStartLesson(lesson) {
    setOpenLessonId(lesson.id);
  }

  // --------------------------
  // Add Community Post Modal
  // --------------------------
  function AddPostModal({ onClose }) {
    const [author, setAuthor] = useState(getDisplayName(user));
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit() {
      if (!text.trim()) return alert("Write something first.");

      setLoading(true);
      try {
        const payload = {
          author,
          text,
          initial: author.charAt(0).toUpperCase(),
          time: "just now"
        };

        const created = await api.post("/community", payload);
        setCommunity(prev => [created, ...prev]);
        onClose();
      } catch (err) {
        alert("Failed to add post");
      }
      setLoading(false);
    }

    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2000
      }}>
        <div style={{ background: "white", padding: 20, borderRadius: 12, width: "90%", maxWidth: 450 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Create Post</h3>
            <button onClick={onClose} style={{ fontSize: 20, border: "none", background: "none" }}>✕</button>
          </div>

          <input
            placeholder="Your name"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 12, borderRadius: 8, border: "1px solid #ddd" }}
          />

          <textarea
            rows={4}
            placeholder="Share something..."
            value={text}
            onChange={e => setText(e.target.value)}
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 10 }}>Cancel</button>
            <button
              onClick={submit}
              disabled={loading}
              style={{ flex: 1, padding: 10, borderRadius: 10, background: "linear-gradient(90deg,var(--purple),var(--blue))", color: "white", border: "none" }}
            >
              {loading ? "Posting…" : "Post"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------
  // HOME PAGE
  // --------------------------
  const HomePage = () => {
    const name = getDisplayName(user);

    return (
      <div className="page page--fade" style={{ padding: 26 }}>
        <div className="home-glass-wrap">
          <div className="home-glass">
            <div className="hero-row">
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <Avatar user={user} />

                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--purple)' }}>
                    Welcome, {name}!
                  </div>

                  <div style={{ color: "#6b7280", fontSize: 15 }}>
                    How are you doing today? 🌱
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="glass-ghost" onClick={() => setActiveTab('expenses')}>
                  View Expenses
                </button>

                <button className="glass-primary" onClick={() => setActiveTab('lessons')}>
                  Start Lesson
                </button>
              </div>
            </div>

            <div className="stats-glass">
              <div className="stat-item">
                <div className="stat-label">Balance</div>
                <div className="stat-value">$2,450</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Spending</div>
                <div className="stat-value" style={{ color: "#10b981" }}>$312</div>
              </div>

              <div className="stat-item">
                <div className="stat-label">Points</div>
                <div className="stat-value" style={{ color: "var(--purple)" }}>150</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------
  // EXPENSES PAGE
  // --------------------------
  const ExpensesPage = () => {
    if (expensesView === "analytics") return <AnalyticsView onBack={() => setExpensesView('list')} />;
    if (expensesView === "add")
      return (
        <AddExpenseForm
          onBack={() => setExpensesView('list')}
          onSaved={(created) => {
            setExpenses(prev => [created, ...prev]);
            setExpensesView('list');
          }}
        />
      );

    const grouped = groupExpensesByDate(expenses);

    return (
      <div className="page page--fade">
        <section className="section">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <h3>Expenses</h3>
              <div style={{ color: "#6b7280" }}>Track your spending</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setExpensesView('analytics')}
                style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #ddd" }}>
                View Analytics
              </button>

              <button
                onClick={() => setExpensesView('add')}
                style={{
                  padding: "10px 18px",
                  borderRadius: 22,
                  background: "linear-gradient(90deg,var(--purple),var(--blue))",
                  color: "white",
                  border: "none"
                }}>
                + Add Expense
              </button>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            {grouped.map(([date, list]) => (
              <div key={date}>
                <div style={{ margin: "10px 0", color: "#6b7280" }}>{formatDateHeader(date)}</div>

                {list.map(e => (
                  <div key={e.id} className="expense-row" style={{
                    padding: 12,
                    background: "white",
                    borderRadius: 10,
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8
                  }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "#ecfdf5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        <ExpenseIcon />
                      </div>

                      <div>
                        <div style={{ fontWeight: 600 }}>{e.title}</div>
                        <div style={{ color: "#9ca3af", fontSize: 13 }}>{e.category}</div>
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
  // LESSONS PAGE
  // --------------------------
  const LessonsPage = () => (
    <div className="page page--fade">
      <section className="section">
        <h3>Learn & Grow</h3>
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          {lessons.map(l => (
            <div key={l.id} onClick={() => handleStartLesson(l)} style={{ cursor: "pointer" }}>
              <GamifiedLessonItem lesson={l} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  // --------------------------
  // COMMUNITY PAGE
  // --------------------------
  const CommunityPage = () => (
    <div className="page page--fade">
      <section className="section">

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Community</h3>
          <button
            onClick={() => setShowAddPost(true)}
            style={{
              padding: "8px 14px",
              background: "linear-gradient(90deg,var(--purple),var(--blue))",
              borderRadius: 22,
              border: "none",
              color: "white",
              fontWeight: 700
            }}>
            + Add Post
          </button>
        </div>

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {community.map(c => (
            <div key={c.id}
              style={{
                background: "white",
                padding: 12,
                borderRadius: 12,
                display: "flex",
                gap: 12,
                alignItems: "flex-start"
              }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(90deg,var(--purple),var(--blue))",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700
              }}>
                {c.initial}
              </div>

              <div>
                <div style={{ fontWeight: 700 }}>
                  {c.author}
                  <span style={{ color: "#9ca3af", marginLeft: 4, fontSize: 12 }}>• {c.time}</span>
                </div>
                <div style={{ marginTop: 4 }}>{c.text}</div>
              </div>
            </div>
          ))}
        </div>

      </section>
    </div>
  );

  // --------------------------
  // PROFILE PAGE
  // --------------------------
  // --------------------------
// PROFILE PAGE (CLEAN + WORKING)
// --------------------------
// --------------------------
// PROFILE PAGE
// --------------------------
const ProfilePage = () => {
  if (showAchievementsInProfile)
    return <AchievementsView onBack={() => setShowAchievementsInProfile(false)} />;

  if (editMode === "profile")
    return <EditProfilePage />;

  if (editMode === "password")
    return <ChangePasswordPage />;

  return (
    <div className="page page--fade">
      <section className="section">
        <h3>Profile</h3>

        <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center" }}>
          <Avatar user={user} size={72} />

          <div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>Username</div>
            <div style={{ fontWeight: 700 }}>{getDisplayName(user)}</div>

            <div style={{ marginTop: 10, fontSize: 12, color: "#9ca3af" }}>Email</div>
            <div style={{ fontWeight: 700 }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          <button
            onClick={() => setEditMode("profile")}
            style={{ padding: 10, borderRadius: 10 }}
          >
            Edit Profile
          </button>

          <button
            onClick={() => setEditMode("password")}
            style={{ padding: 10, borderRadius: 10 }}
          >
            Change Password
          </button>

          <button
            onClick={() => setShowAchievementsInProfile(true)}
            style={{
              padding: 10,
              borderRadius: 10,
              background: "linear-gradient(90deg,var(--purple),var(--blue))",
              color: "white",
              border: "none",
            }}
          >
            View Achievements
          </button>
        </div>
      </section>
    </div>
  );
};
// --------------------------
// EDIT PROFILE PAGE
// --------------------------
const EditProfilePage = () => {
  const [username, setUsername] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  function save() {
    // only update local state; backend optional
    user.name = username;
    user.email = email;
    setEditMode(null);
  }

  return (
    <div className="page page--fade">
      <section className="section">
        <button
          onClick={() => setEditMode(null)}
          style={{
            background: "white",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--purple)",
            marginBottom: 16
          }}
        >
          ←
        </button>

        <h3>Edit Profile</h3>

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label>
            <div style={{ fontWeight: 600 }}>Username</div>
            <input className="input"
              value={username}
              onChange={e => setUsername(e.target.value)} />
          </label>

          <label>
            <div style={{ fontWeight: 600 }}>Email</div>
            <input className="input"
              value={email}
              onChange={e => setEmail(e.target.value)} />
          </label>

          <button
            onClick={save}
            className="onboard-btn"
            style={{ borderRadius: 12 }}
          >
            Save Changes
          </button>
        </div>
      </section>
    </div>
  );
};
// --------------------------
// CHANGE PASSWORD PAGE
// --------------------------
const ChangePasswordPage = () => {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  function save() {
    if (newPass !== confirm) {
      alert("Passwords do not match!");
      return;
    }
    alert("Password changed (demo only)");
    setEditMode(null);
  }

  return (
    <div className="page page--fade">
      <section className="section">
        <button
          onClick={() => setEditMode(null)}
          style={{
            background: "white",
            border: "none",
            borderRadius: "50%",
            width: 40,
            height: 40,
            boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--purple)",
            marginBottom: 16
          }}
        >
          ←
        </button>

        <h3>Change Password</h3>

        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label>
            <div style={{ fontWeight: 600 }}>Old Password</div>
            <input className="input" type="password"
              value={oldPass}
              onChange={e => setOldPass(e.target.value)} />
          </label>

          <label>
            <div style={{ fontWeight: 600 }}>New Password</div>
            <input className="input" type="password"
              value={newPass}
              onChange={e => setNewPass(e.target.value)} />
          </label>

          <label>
            <div style={{ fontWeight: 600 }}>Confirm Password</div>
            <input className="input" type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)} />
          </label>

          <button
            onClick={save}
            className="onboard-btn"
            style={{ borderRadius: 12 }}
          >
            Update Password
          </button>
        </div>
      </section>
    </div>
  );
};



  // --------------------------
  // MAIN RENDER
  // --------------------------
  return (
    <div className="dash-root" style={{ paddingBottom: 120 }}>
      {activeTab === "home" && <HomePage />}
      {activeTab === "expenses" && <ExpensesPage />}

      {activeTab === "lessons" &&
        (openLessonId ? (
          <LessonDetail
            lessonId={openLessonId}
            onClose={() => setOpenLessonId(null)}
            onCompleted={(result) => {
              if (result?.updatedLesson) {
                setLessons(prev =>
                  prev.map(l => (l.id === result.updatedLesson.id ? { ...l, ...result.updatedLesson } : l))
                );
              }
              api.get("/achievements").catch(() => {});
              if (result?.passed) setOpenLessonId(null);
            }}
          />
        ) : (
          <LessonsPage />
        ))}

      {activeTab === "community" && <CommunityPage />}
      {activeTab === "profile" && <ProfilePage />}

      {showAddPost && <AddPostModal onClose={() => setShowAddPost(false)} />}

      <NavBar
        active={activeTab}
        onChange={(tab) => {
          setActiveTab(tab);
          if (tab === "expenses") setExpensesView("list");
        }}
      />
    </div>
  );
}
