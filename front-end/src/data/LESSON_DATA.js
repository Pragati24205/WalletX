// frontend/src/data/LESSON_DATA.js
export const LESSON_DATA = {
  "understanding-credit": {
    id: "understanding-credit",
    title: "Understanding Credit",
    slides: [
      { id: "s1", text: "What is credit? Credit lets you borrow money now and pay later." },
      { id: "s2", text: "Good credit = better interest rates. Build it by paying on time." },
      { id: "s3", text: "Keep balances low and avoid opening unnecessary accounts." }
    ],
    quiz: [
      {
        question: "What does 'credit' let you do?",
        options: ["Save money automatically", "Borrow money now and pay later", "Delete debt instantly"]
      },
      {
        question: "Which action helps build good credit?",
        options: ["Paying on time", "Ignoring bills", "Taking unnecessary loans"]
      },
      {
        question: "A good credit habit is:",
        options: ["Carrying very high balances", "Making at least minimum payments on time", "Closing all accounts immediately"]
      }
    ]
  },

  "budgeting-basics": {
    id: "budgeting-basics",
    title: "Budgeting Basics",
    slides: [
      { id: "b1", text: "Budgeting helps you allocate money to needs, wants and savings." },
      { id: "b2", text: "Try the 50/30/20 rule: needs/wants/savings." }
    ],
    quiz: [
      {
        question: "The 50/30/20 rule is for:",
        options: ["Investing strategy", "Budget allocation", "Tax planning"]
      },
      {
        question: "What should you prioritize in a budget?",
        options: ["Savings and essentials", "Only wants", "Only entertainment"]
      }
    ]
  },

  "saving-strategies": {
    id: "saving-strategies",
    title: "Saving Strategies",
    slides: [
      { id: "sv1", text: "Automate savings to pay yourself first." },
      { id: "sv2", text: "Use small, repeated steps — they compound over time." }
    ],
    quiz: [
      {
        question: "A good saving habit is:",
        options: ["Automating transfers to savings", "Spending first then saving", "Avoid tracking expenses"]
      },
      {
        question: "Small repeated savings over time:",
        options: ["Don't matter", "Can compound into something meaningful", "Are illegal"]
      }
    ]
  }
};
