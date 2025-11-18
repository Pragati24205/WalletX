// frontend/src/components/Quiz.jsx
import React, { useState } from 'react';
import api from '../api';

/* ----------------------------
   Result Modal
----------------------------- */
function ResultModal({ passed, pointsEarned, onClose, onRetry }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.45)', zIndex: 2000
    }}>
      <div style={{
        width: 360,
        background: 'white',
        padding: 24,
        borderRadius: 14,
        textAlign: 'center',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
          {passed ? '🎉 Correct!' : '❌ Try Again'}
        </div>

        <div style={{ color: '#6b7280', marginBottom: 18 }}>
          {passed
            ? `You earned ${pointsEarned} points!`
            : 'No points earned this time.'}
        </div>

        {passed ? (
          <>
            <div style={{
              background: '#e9fdf3',
              padding: 12,
              borderRadius: 10,
              marginBottom: 18,
              color: '#059669',
              fontWeight: 700,
              fontSize: 16
            }}>
              + {pointsEarned} Points
            </div>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: 12,
                background: 'linear-gradient(90deg,var(--purple),var(--blue))',
                color: 'white',
                borderRadius: 10,
                border: 'none',
                fontWeight: 700
              }}
            >
              Continue
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onRetry}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                border: '1px solid #e6edf3'
              }}
            >
              Retry
            </button>

            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 10,
                background: '#f97316',
                color: 'white',
                fontWeight: 700,
                border: 'none'
              }}
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------
   Quiz Component
----------------------------- */
export default function Quiz({ lessonId, quiz, onBack, onResult }) {
  const [answers, setAnswers] = useState(Array(quiz.length).fill(null));
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [modal, setModal] = useState(null);

  function selectOption(qIdx, optIdx) {
    setAnswers(prev => {
      const copy = [...prev];
      copy[qIdx] = optIdx;
      return copy;
    });
  }

  async function submitQuiz() {
    setSubmitting(true);
    try {
      const payload = { userId: 1, lessonId, answers };
      const res = await api.post('/quiz/submit', payload);

      setModal(res);
      if (onResult) onResult(res);

    } catch (err) {
      alert('Submission failed: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    setCurrentQ(i => Math.min(quiz.length - 1, i + 1));
  }
  function goPrev() {
    setCurrentQ(i => Math.max(0, i - 1));
  }

  return (
    <div className="section" style={{ paddingBottom: 40 }}>
      {/* Back Button */}
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
          marginBottom: 12
        }}
      >
        ←
      </button>

      {/* Title */}
      <h2>Quiz Time!</h2>
      <div style={{ color: '#6b7280', marginBottom: 8 }}>
        Question {currentQ + 1} of {quiz.length}
      </div>

      {/* Question Card */}
      <div style={{
        background: 'white',
        padding: 18,
        borderRadius: 14,
        boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
        marginBottom: 20
      }}>
        <div style={{ fontWeight: 700, marginBottom: 16 }}>
          {quiz[currentQ].question}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {quiz[currentQ].options.map((opt, idx) => {
            const selected = answers[currentQ] === idx;

            return (
              <label
                key={idx}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: selected ? '2px solid var(--purple)' : '1px solid #eef2ff',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  boxShadow: selected
                    ? '0 4px 12px rgba(124,58,237,0.15)'
                    : '0 4px 10px rgba(15,23,42,0.03)'
                }}
              >
                <input
                  type="radio"
                  checked={selected}
                  onChange={() => selectOption(currentQ, idx)}
                />
                <div style={{ fontWeight: 600 }}>{opt}</div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={goPrev}
          disabled={currentQ === 0}
          style={{
            flex: 1, padding: 12, borderRadius: 12,
            border: '1px solid #e6edf3', background: 'white'
          }}
        >
          Previous
        </button>

        {currentQ < quiz.length - 1 ? (
          <button
            onClick={goNext}
            style={{
              flex: 1, padding: 12, borderRadius: 12,
              background: 'linear-gradient(90deg,var(--purple),var(--blue))',
              color: 'white', border: 'none'
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={submitQuiz}
            disabled={submitting}
            style={{
              flex: 1, padding: 12, borderRadius: 12,
              background: 'linear-gradient(90deg,var(--purple),var(--blue))',
              color: 'white', border: 'none'
            }}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        )}
      </div>

      {/* Result Modal */}
      {modal && (
        <ResultModal
          passed={modal.passed}
          pointsEarned={modal.pointsEarned}
          onClose={() => setModal(null)}
          onRetry={() => {
            setModal(null);
            setAnswers(Array(quiz.length).fill(null));
            setCurrentQ(0);
          }}
        />
      )}
    </div>
  );
}
