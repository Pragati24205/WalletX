// data.js (backend)
module.exports = {
  // sample expenses (simple demo)
  sampleExpenses: [
    { id: Date.now() - 86400000, title: "Groceries", amount: "32.50", category: "Food", date: new Date(Date.now() - 86400000).toISOString().slice(0,10) },
    { id: Date.now() - 2*86400000, title: "Bus pass", amount: "12.00", category: "Transport", date: new Date(Date.now() - 2*86400000).toISOString().slice(0,10) },
  ],

  // lessons must match LESSON_DATA ids
  lessons: [
    { id: "understanding-credit", title: "Understanding Credit", progress: 0, locked: false, xp: 100 },
    { id: "budgeting-basics", title: "Budgeting Basics", progress: 0, locked: true, xp: 80 },
    { id: "saving-strategies", title: "Saving Strategies", progress: 0, locked: true, xp: 80 },
  ],

  // community posts
  communityPosts: [
    { id: 1, author: "Vivek Vardhan", initial: "E", time: "1 day ago", text: "Completed all beginner lessons! The tips on tracking expenses are so helpful." },
    { id: 2, author: "Venu", initial: "M", time: "5 hours ago", text: "Anyone else using the 50-30-20 budgeting rule? It's been a game-changer for me!" }
  ],

  // demo users
  users: [
    { id: 1, name: "Pragati", email: "pragati@example.com", points: 0 }
  ]
};
