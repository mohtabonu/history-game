import { useState, useEffect, useCallback } from "react";
import { questions } from "./db";

const TIMER_MAX = 15;
const labels = ["а", "б", "в", "г"];

type Answer = {
  selected: number | null;
  correct: number;
};

export default function QuizGame() {
  const [screen, setScreen] = useState<"start" | "quiz" | "result">("start");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(TIMER_MAX);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const goNext = useCallback(() => {
    const next = current + 1;
    if (next >= questions.length) {
      setScreen("result");
    } else {
      setCurrent(next);
      setSelected(null);
      setTimer(TIMER_MAX);
      setLocked(false);
    }
  }, [current]);

  useEffect(() => {
    if (screen !== "quiz" || locked) return;

    if (timer === 0) {
      // barcha state o'zgarishlarini setTimeout ichiga surish
      setTimeout(() => {
        setLocked(true);
        setAnswers((prev) => [
          ...prev,
          { selected: null, correct: questions[current].answer },
        ]);
        goNext();
      }, 0);
      return;
    }

    const t = setTimeout(() => setTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, screen, locked, goNext, current]);

  const handleSelect = (idx: number) => {
    if (locked) return;

    setSelected(idx);
    setLocked(true);
    const correct = questions[current].answer;
    const isCorrect = idx === correct;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { selected: idx, correct }]);
    setTimeout(goNext, 900);
  };

  const restart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setTimer(TIMER_MAX);
    setLocked(false);
    setAnswers([]);
    setScreen("start");
  };

  // const progress = (current / questions.length) * 100;
  const timerPct = (timer / TIMER_MAX) * 100;

  const styles = {
    root: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #fff8f0 0%, #ffe8cc 40%, #ffd4a8 100%)",
      fontFamily: "'Georgia', serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      boxSizing: "border-box",
    } as const,
    card: {
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(12px)",
      borderRadius: "24px",
      boxShadow: "0 8px 48px rgba(230,100,20,0.15), 0 2px 8px rgba(0,0,0,0.06)",
      width: "100%",
      maxWidth: "560px",
      minWidth: "160px",
      padding: "clamp(20px, 5vw, 44px)",
      boxSizing: "border-box",
      border: "1.5px solid rgba(255,160,60,0.25)",
    } as const,
  };

  // ---- START SCREEN ----
  if (screen === "start") {
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: "clamp(36px,10vw,64px)", marginBottom: 8 }}>
              🔥
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(22px,6vw,36px)",
                color: "#c45000",
                letterSpacing: "-0.5px",
                fontWeight: 800,
              }}
            >
              Новая Европа
            </h1>
            <p
              style={{
                color: "#8a5a3a",
                marginTop: 10,
                fontSize: "clamp(13px,3vw,16px)",
                lineHeight: 1.6,
              }}
            >
              10 вопросов · 10 секунд на каждый · 4 варианта ответа
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 32,
            }}
          >
            {[
              ["🎯", "За каждый правильный ответ — 1 балл"],
              ["⏱️", "На каждый вопрос 10 секунд"],
              ["🏆", "Максимальный балл: 10"],
            ].map(([icon, text]) => (
              <div
                key={text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: "#fff5eb",
                  borderRadius: 12,
                  padding: "10px 14px",
                  fontSize: "clamp(12px,3vw,14px)",
                  color: "#7a4a2a",
                }}
              >
                <span style={{ fontSize: 18 }}>{icon}</span>
                {text}
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("quiz")}
            style={{
              width: "100%",
              padding: "clamp(12px,3vw,18px)",
              background: "linear-gradient(135deg, #ff7020, #ff9040)",
              color: "white",
              border: "none",
              borderRadius: 14,
              fontSize: "clamp(15px,4vw,19px)",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.5,
              boxShadow: "0 4px 20px rgba(255,100,20,0.4)",
              transition: "transform 0.1s",
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget as HTMLButtonElement;
              btn.style.transform = "scale(1)";
            }}
          >
            Начать игру →
          </button>
        </div>
      </div>
    );
  }

  // ---- RESULT SCREEN ----
  if (screen === "result") {
    const pct = (score / questions.length) * 100;
    const emoji =
      score >= 9
        ? "🏆"
        : score >= 7
          ? "🌟"
          : score >= 5
            ? "👍"
            : score >= 3
              ? "😅"
              : "💪";
    const msg =
      score >= 9
        ? "Блестяще!"
        : score >= 7
          ? "Отлично!"
          : score >= 5
            ? "Хорошо!"
            : score >= 3
              ? "Неплохо!"
              : "Попробуй ещё!";

    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: "clamp(44px,12vw,72px)" }}>{emoji}</div>
            <h2
              style={{
                margin: "8px 0 4px",
                fontSize: "clamp(22px,6vw,34px)",
                color: "#c45000",
                fontWeight: 800,
              }}
            >
              {msg}
            </h2>
            <p
              style={{
                color: "#8a5a3a",
                margin: 0,
                fontSize: "clamp(13px,3vw,16px)",
              }}
            >
              Ваш результат
            </p>
          </div>

          <div
            style={{
              background: "linear-gradient(135deg, #ff7020, #ff9040)",
              borderRadius: 16,
              padding: "20px",
              textAlign: "center",
              marginBottom: 24,
              color: "white",
            }}
          >
            <div
              style={{
                fontSize: "clamp(42px,11vw,64px)",
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {score}
              <span style={{ fontSize: "0.5em", opacity: 0.8 }}>/10</span>
            </div>
            <div
              style={{
                opacity: 0.85,
                marginTop: 4,
                fontSize: "clamp(12px,3vw,14px)",
              }}
            >
              правильных ответов
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                height: 10,
                background: "#ffe0c0",
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: "linear-gradient(90deg,#ff7020,#ffaa40)",
                  borderRadius: 99,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              marginBottom: 24,
              maxHeight: 220,
              overflowY: "auto",
            }}
          >
            {answers.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: a.selected === a.correct ? "#f0fdf4" : "#fff5f5",
                  border: `1px solid ${a.selected === a.correct ? "#86efac" : "#fca5a5"}`,
                  fontSize: "clamp(11px,2.5vw,13px)",
                }}
              >
                <span style={{ fontSize: 14 }}>
                  {a.selected === a.correct ? "✅" : "❌"}
                </span>
                <span style={{ color: "#7a4a2a", flex: 1 }}>
                  Вопрос {i + 1}
                </span>
                {a.selected !== null && a.selected !== a.correct && (
                  <span
                    style={{
                      color: "#c45000",
                      fontSize: "clamp(10px,2vw,12px)",
                    }}
                  >
                    → {labels[a.correct]})
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={restart}
            style={{
              width: "100%",
              padding: "clamp(12px,3vw,16px)",
              background: "linear-gradient(135deg, #ff7020, #ff9040)",
              color: "white",
              border: "none",
              borderRadius: 14,
              fontSize: "clamp(14px,4vw,17px)",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(255,100,20,0.35)",
            }}
          >
            🔄 Играть снова
          </button>
        </div>
      </div>
    );
  }

  // ---- QUIZ SCREEN ----
  const q = questions[current];
  const timerColor =
    timer <= 3 ? "#ef4444" : timer <= 6 ? "#f97316" : "#22c55e";

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: "clamp(12px,3vw,14px)",
              color: "#8a5a3a",
              fontWeight: 600,
            }}
          >
            Вопрос {current + 1} / {questions.length}
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: timer <= 3 ? "#fef2f2" : "#fff8f0",
              borderRadius: 99,
              padding: "4px 12px",
              border: `1.5px solid ${timerColor}`,
              transition: "all 0.3s",
            }}
          >
            <span style={{ fontSize: 14 }}>⏱</span>
            <span
              style={{
                fontSize: "clamp(14px,4vw,18px)",
                fontWeight: 800,
                color: timerColor,
                minWidth: 18,
                textAlign: "center",
                transition: "color 0.3s",
              }}
            >
              {timer}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            background: "#ffe0c0",
            borderRadius: 99,
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((current + 1) / questions.length) * 100}%`,
              background: "linear-gradient(90deg, #ff7020, #ffaa40)",
              borderRadius: 99,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Timer ring visual */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <div
            style={{
              height: 5,
              background: "#f0f0f0",
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${timerPct}%`,
                background: timerColor,
                borderRadius: 99,
                transition: "width 1s linear, background 0.5s",
              }}
            />
          </div>
        </div>

        {/* Score chip */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 16,
          }}
        >
          <span
            style={{
              background: "linear-gradient(135deg,#ff7020,#ff9040)",
              color: "white",
              borderRadius: 99,
              padding: "3px 14px",
              fontSize: "clamp(11px,2.5vw,13px)",
              fontWeight: 700,
            }}
          >
            🏅 {score} очков
          </span>
        </div>

        {/* Question */}
        <div
          style={{
            background: "linear-gradient(135deg, #fff5eb, #ffe8d0)",
            borderRadius: 16,
            padding: "clamp(14px,4vw,22px)",
            marginBottom: 20,
            border: "1.5px solid rgba(255,140,60,0.2)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "clamp(14px,4vw,18px)",
              color: "#5a3010",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(8px,2vw,12px)",
          }}
        >
          {q.options.map((opt, idx) => {
            const isCorrect = idx === q.answer;
            const isSelected = selected === idx;
            let bg = "white";
            let border = "1.5px solid #f0d0b0";
            let color = "#5a3010";
            let shadow = "none";

            if (locked) {
              if (isCorrect) {
                bg = "#f0fdf4";
                border = "2px solid #22c55e";
                color = "#15803d";
                shadow = "0 0 0 3px rgba(34,197,94,0.12)";
              } else if (isSelected) {
                bg = "#fef2f2";
                border = "2px solid #ef4444";
                color = "#b91c1c";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={locked}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(8px,2vw,14px)",
                  padding: "clamp(10px,3vw,14px) clamp(12px,3vw,18px)",
                  background: bg,
                  border,
                  borderRadius: 12,
                  cursor: locked ? "default" : "pointer",
                  textAlign: "left",
                  transition: "all 0.25s",
                  boxShadow: shadow,
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  if (!locked) e.currentTarget.style.background = "#fff5eb";
                }}
                onMouseLeave={(e) => {
                  if (!locked) e.currentTarget.style.background = "white";
                }}
              >
                <span
                  style={{
                    minWidth: "clamp(26px,6vw,34px)",
                    height: "clamp(26px,6vw,34px)",
                    borderRadius: "50%",
                    background:
                      locked && isCorrect
                        ? "#22c55e"
                        : locked && isSelected
                          ? "#ef4444"
                          : "linear-gradient(135deg,#ff7020,#ff9040)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "clamp(11px,3vw,14px)",
                    fontWeight: 800,
                    flexShrink: 0,
                    transition: "background 0.25s",
                  }}
                >
                  {locked && isCorrect
                    ? "✓"
                    : locked && isSelected && !isCorrect
                      ? "✗"
                      : labels[idx] + ")"}
                </span>
                <span
                  style={{
                    fontSize: "clamp(12px,3vw,15px)",
                    color,
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
