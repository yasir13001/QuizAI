const API = "/api";
const elQ = document.getElementById("question");
const elOpts = document.getElementById("options");
const elNext = document.getElementById("next-btn");
const elStatus = document.getElementById("status");

let currentQ = null;

// Initialize session score
if (!sessionStorage.getItem("score")) {
  sessionStorage.setItem("score", "0");
  sessionStorage.setItem("total", "0");
}

elNext.addEventListener("click", async () => {
  if (currentQ) {
    const selected = document.querySelector('input[name="opt"]:checked');
    if (!selected) return alert("Please choose an answer!");

    let score = Number(sessionStorage.getItem("score"));
    let total = Number(sessionStorage.getItem("total"));

    total++;
    if (selected.value === currentQ.correct_answer) score++;

    sessionStorage.setItem("score", score);
    sessionStorage.setItem("total", total);
    elStatus.textContent = `Score: ${score} / ${total}`;
  }

  const res = await fetch(`${API}/question`);
  currentQ = await res.json();
  renderQuestion(currentQ);
});

function renderQuestion(q) {
  elQ.textContent = q.question;
  elOpts.innerHTML = "";
  q.options.forEach(opt => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="radio" name="opt" value="${opt}"/> ${opt}</label>`;
    elOpts.appendChild(li);
  });
}
