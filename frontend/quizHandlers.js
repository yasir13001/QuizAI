import { loadQuestion } from './quizApi.js';
import { startTimer, stopTimer, recordTime, resetTimer, questionTimes } from './timer.js';
import { renderQuestion, showSummary, showReview } from './quizUI.js';

let questionHistory = JSON.parse(sessionStorage.getItem("questionHistory") || "[]");

export function startQuiz() {
  sessionStorage.setItem("score", "0");
  sessionStorage.setItem("total", "0");
  questionHistory = [];
  sessionStorage.setItem("questionHistory", JSON.stringify(questionHistory));
  document.getElementById("status").textContent = "";
  document.getElementById("next-btn").style.display = "inline-block";
  loadQuestion();
}

export async function nextQuestion() {
  const currentQ = window.currentQ;
  if (currentQ && currentQ.options) {
    const selected = document.querySelector('input[name="opt"]:checked');
    if (!selected) {
      alert("Please choose an answer!");
      return;
    }

    let score = Number(sessionStorage.getItem("score"));
    let total = Number(sessionStorage.getItem("total"));

    total++;
    if (selected.value === currentQ.correct_answer) {
      score++;
    }

    // Save question, user answer, and correct answer to history
    const category = document.getElementById("category").value;
    questionHistory.push({
      question: currentQ.question,
      options: currentQ.options,
      userAnswer: selected.value,
      correctAnswer: currentQ.correct_answer,
      category
    });
    sessionStorage.setItem("questionHistory", JSON.stringify(questionHistory));

    sessionStorage.setItem("score", score);
    sessionStorage.setItem("total", total);

    document.getElementById("status").textContent = `Score: ${score} / ${total}`;
  }

  recordTime();
  stopTimer();
  await loadQuestion();
}

export function exportResults() {
  const score = sessionStorage.getItem("score");
  const total = sessionStorage.getItem("total");
  const history = JSON.parse(sessionStorage.getItem("questionHistory") || "[]");

  // TXT export
  let txt = `GRE Quiz Results:\nScore: ${score} / ${total}\n\n`;
  history.forEach((q, i) => {
    txt += `Q${i+1}: ${q.question}\n`;
    txt += `Your answer: ${q.userAnswer}\n`;
    txt += `Correct answer: ${q.correctAnswer}\n`;
    txt += `Category: ${q.category}\n\n`;
  });

  // CSV export
  let csv = "Question,Your Answer,Correct Answer,Category\n";
  history.forEach(q => {
    // Escape quotes and commas
    const escape = s => `"${String(s).replace(/"/g, '""')}"`;
    csv += [
      escape(q.question),
      escape(q.userAnswer),
      escape(q.correctAnswer),
      escape(q.category)
    ].join(",") + "\n";
  });

  // Ask user for format
  const format = prompt("Export as TXT or CSV? (type 'csv' for CSV, anything else for TXT)").toLowerCase();
  let blob, filename;
  if (format === "csv") {
    blob = new Blob([csv], { type: "text/csv" });
    filename = "gre_quiz_results.csv";
  } else {
    blob = new Blob([txt], { type: "text/plain" });
    filename = "gre_quiz_results.txt";
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}

export function restartQuiz() {
  sessionStorage.clear();
  questionHistory = [];
  resetTimer();
  document.getElementById("status").textContent = "";
  document.getElementById("question").textContent = 'Quiz restarted. Click "Start Quiz" to begin.';
  document.getElementById("options").innerHTML = "";
  document.getElementById("next-btn").style.display = "none";
}

export function showFinalScore() {
  showSummary();
}

export function reviewAnswers() {
  showReview();
}
//keyboard shortcuts
function handleKeyPress(e) {
  const key = e.key.toUpperCase();
  if (["A", "B", "C", "D"].includes(key)) {
    const options = document.querySelectorAll('input[name="opt"]');
    const index = key.charCodeAt(0) - 65; // A = 0, B = 1...
    if (options[index]) {
      options[index].checked = true;
    }
  }

  // Optional: allow "Enter" to act like "Next"
  if (e.key === "Enter") {
    const nextBtn = document.getElementById("next-btn");
    if (nextBtn && nextBtn.style.display !== "none") {
      nextBtn.click();
    }
  }
}

document.addEventListener("keydown", handleKeyPress);
