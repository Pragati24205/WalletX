// frontend/src/components/LessonDetail.jsx
import React, { useState } from 'react';
import { LESSON_DATA } from '../data/LESSON_DATA';
import Quiz from './Quiz';

export default function LessonDetail({ lessonId, onClose, onCompleted }) {
  /* ------------------------------
     Hooks ALWAYS first
  ------------------------------- */
  const [slideIndex, setSlideIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  /* ------------------------------
     Get lesson (safe)
  ------------------------------- */
  const lesson = LESSON_DATA[lessonId];

  if (!lesson) {
    return (
      <div className="section" style={{ padding: 16 }}>
        <button
          onClick={onClose}
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

        <h2>Lesson not found</h2>
        <div style={{ color: '#6b7280' }}>This lesson does not exist.</div>
      </div>
    );
  }

  const slides = lesson.slides || [];
  const totalSlides = slides.length;

  /* ------------------------------
     Navigation
  ------------------------------- */
  const nextSlide = () =>
    setSlideIndex(i => Math.min(totalSlides - 1, i + 1));

  const prevSlide = () =>
    setSlideIndex(i => Math.max(0, i - 1));

  /* ------------------------------
     Quiz Screen
  ------------------------------- */
  if (showQuiz) {
    return (
      <Quiz
        lessonId={lessonId}
        quiz={lesson.quiz}
        onBack={() => setShowQuiz(false)}
        onResult={(result) => {
          onCompleted?.(result);
          setShowQuiz(false);
          if (result?.passed) onClose?.();
        }}
      />
    );
  }

  /* ------------------------------
     Main Slides View
  ------------------------------- */
  return (
    <div className="section" style={{ paddingBottom: 40 }}>
      
      {/* Back Button */}
      <button
        onClick={onClose}
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

      <h2>{lesson.title}</h2>
      <div style={{ color: '#6b7280', marginBottom: 8 }}>
        Slide {slideIndex + 1} of {totalSlides}
      </div>

      {/* Slide progress bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {slides.map((s, idx) => (
          <div
            key={s.id ?? idx}
            style={{
              height: 6,
              flex: 1,
              borderRadius: 6,
              background:
                idx <= slideIndex
                  ? 'linear-gradient(90deg,var(--purple),var(--blue))'
                  : '#eef2ff'
            }}
          />
        ))}
      </div>

      {/* Slide Card */}
      <div
        style={{
          background: 'white',
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 8px 20px rgba(0,0,0,0.04)',
          marginBottom: 24,
          transition: "0.3s ease"
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'linear-gradient(90deg,var(--purple),var(--blue))',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}
          >
            {slideIndex + 1}
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#374151' }}>
          {slides[slideIndex]?.text}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Previous */}
        <button
          onClick={prevSlide}
          disabled={slideIndex === 0}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #e6edf3',
            background: 'white',
            opacity: slideIndex === 0 ? 0.5 : 1
          }}
        >
          Previous
        </button>

        {/* Next or Quiz */}
        {slideIndex < totalSlides - 1 ? (
          <button
            onClick={nextSlide}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(90deg,var(--purple),var(--blue))',
              color: 'white'
            }}
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => setShowQuiz(true)}
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(90deg,var(--purple),var(--blue))',
              color: 'white'
            }}
          >
            Take Quiz
          </button>
        )}
      </div>
    </div>
  );
}
