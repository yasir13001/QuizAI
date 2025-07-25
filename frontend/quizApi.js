import { renderQuestion } from './quizUI.js';
import { startTimer } from './timer.js';

export async function loadQuestion() {
  const elSpinner = document.getElementById("spinner");
  elSpinner.style.display = "block";
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;
  try {
    const response = await fetch(`/api/question?category=${category}&difficulty=${difficulty}`);
    const data = await response.json();
    window.currentQ = data;
    renderQuestion(data);
    startTimer();
  } catch (err) {
    document.getElementById("question").textContent = "Failed to load question. Please try again.";
    document.getElementById("options").innerHTML = "";
  } finally {
    elSpinner.style.display = "none";
  }
}