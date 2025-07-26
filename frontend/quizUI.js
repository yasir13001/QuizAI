import { questionTimes } from './timer.js';

export function renderQuestion(q) {
  const elQ = document.getElementById("question");
  const elOpts = document.getElementById("options");
  elQ.textContent = q.question;
  elOpts.innerHTML = "";

  if (q.options) {
    q.options.forEach(opt => {
      const li = document.createElement("li");
      li.innerHTML = `
        <label>
          <input type="radio" name="opt" value="${opt}"> ${opt}
        </label>`;
      elOpts.appendChild(li);
    });
    document.getElementById("next-btn").style.display = "inline-block";
  } else {
    document.getElementById("next-btn").style.display = "none";
    elOpts.innerHTML = "";
  }
}

export function showSummary() {
  const score = sessionStorage.getItem("score");
  const total = sessionStorage.getItem("total");
  let timeSummary = "";
  if (questionTimes.length) {
    timeSummary = "<br>Time per question: " + questionTimes.map((t, i) => `Q${i+1}: ${t}s`).join(", ");
  }

  // Analytics per Category
  const history = JSON.parse(sessionStorage.getItem("questionHistory") || "[]");
  const categoryStats = {};
  history.forEach(q => {
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { correct: 0, total: 0 };
    }
    categoryStats[q.category].total++;
    if (q.userAnswer === q.correctAnswer) categoryStats[q.category].correct++;
  });

  let analytics = "<br><b>Performance by Category:</b><br>";
  for (const cat in categoryStats) {
    analytics += `${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${categoryStats[cat].correct} / ${categoryStats[cat].total}<br>`;
  }

  document.getElementById("status").innerHTML = `Quiz Complete! Final Score: ${score} / ${total}${timeSummary}${analytics}`;
  document.getElementById("next-btn").style.display = "none";
  document.getElementById("question").textContent = "Thank you for playing!";
  document.getElementById("options").innerHTML = "";
}

export function showReview() {
  const elQ = document.getElementById("question");
  const elOpts = document.getElementById("options");
  const elStatus = document.getElementById("status");
  const history = JSON.parse(sessionStorage.getItem("questionHistory") || "[]");
  if (!history.length) {
    elStatus.textContent = "No questions to review.";
    return;
  }
  elQ.textContent = "Review Mode";
  elOpts.innerHTML = history.map((q, i) => `
    <li>
      <strong>Q${i+1}:</strong> ${q.question}<br>
      Your answer: <span style="color:${q.userAnswer === q.correctAnswer ? 'green' : 'red'}">${q.userAnswer}</span><br>
      Correct answer: <b>${q.correctAnswer}</b><br>
      Category: ${q.category}
    </li>
  `).join("");
  document.getElementById("next-btn").style.display = "none";
}