document.addEventListener("DOMContentLoaded", () => {
  const API = "/api";
  const elQ = document.getElementById("question");
  const elOpts = document.getElementById("options");
  const elNext = document.getElementById("next-btn");
  const elStatus = document.getElementById("status");
  const elCategory = document.getElementById("category");
  const elSpinner = document.getElementById("spinner");
  const elExportButton = document.getElementById("export-results");
  let currentQ = null;

  // Initialize score
  if (!sessionStorage.getItem("score")) {
    sessionStorage.setItem("score", "0");
    sessionStorage.setItem("total", "0");
  }

  // Start Quiz
  document.getElementById("load-question").addEventListener("click", async () => {
    sessionStorage.setItem("score", "0");
    sessionStorage.setItem("total", "0");
    elStatus.textContent = "";
    elNext.style.display = "inline-block";
    await loadQuestion();
  });

  // Next Question logic
  elNext.addEventListener("click", async () => {
    if (!currentQ || !currentQ.options) return;

    const selected = document.querySelector('input[name="opt"]:checked');
    if (!selected) {
      alert("Please choose an answer!");
      return;
    }

    // Save answer to backend
    await fetch(`${API}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: currentQ.question,
        user_answer: selected.value
      })
    });

    let score = Number(sessionStorage.getItem("score"));
    let total = Number(sessionStorage.getItem("total"));
    total++;
    if (selected.value === currentQ.correct_answer) {
      score++;
    }
    sessionStorage.setItem("score", score);
    sessionStorage.setItem("total", total);
    elStatus.textContent = `Score: ${score} / ${total}`;

    await loadQuestion();
  });

  // Export Results
  elExportButton.addEventListener("click", () => {
    const score = sessionStorage.getItem("score");
    const total = sessionStorage.getItem("total");
    const resultsText = `GRE Quiz Results:\nScore: ${score} / ${total}`;
    const blob = new Blob([resultsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gre_quiz_results.txt";
    a.click();
  });

  // View Question History (console)
  document.getElementById("view-history").addEventListener("click", async () => {
    const res = await fetch(`${API}/history`);
    const data = await res.json();
    console.log("📜 Question History:", data);
    alert("History logged in console!");
  });

  // View Analytics (console)
  document.getElementById("view-analytics").addEventListener("click", async () => {
    const res = await fetch(`${API}/analytics`);
    const data = await res.json();
    console.log("📊 Analytics Per Category:", data);
    alert("Analytics logged in console!");
  });

  // Fetch question from backend
  async function loadQuestion() {
    const category = elCategory.value;
    elSpinner.style.display = "block";
    const response = await fetch(`${API}/question?category=${category}`);
    const data = await response.json();
    currentQ = data;
    elSpinner.style.display = "none";
    renderQuestion(data);
  }

  // Render question and options as radio buttons
  function renderQuestion(q) {
    elQ.textContent = q.question || "";
    elOpts.innerHTML = "";
    if (q.options) {
      q.options.forEach(opt => {
        const li = document.createElement("li");
        li.innerHTML = `
          <label>
            <input type="radio" name="opt" value="${opt}">
            ${opt}
          </label>
        `;
        elOpts.appendChild(li);
      });
      elNext.style.display = "inline-block";
    } else {
      elNext.style.display = "none";
      elOpts.innerHTML = "";
    }
  }
});

