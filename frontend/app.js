import { startQuiz, nextQuestion, exportResults, restartQuiz, showFinalScore, reviewAnswers } from './quizHandlers.js';

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("load-question").addEventListener("click", startQuiz);
  document.getElementById("next-btn").addEventListener("click", nextQuestion);
  document.getElementById("export-results").addEventListener("click", exportResults);
  document.getElementById("restart-quiz").addEventListener("click", restartQuiz);
  document.getElementById("show-final-score").addEventListener("click", showFinalScore);
  document.getElementById("review-answers").addEventListener("click", reviewAnswers);
});
