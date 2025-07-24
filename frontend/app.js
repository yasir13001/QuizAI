import { startQuiz, nextQuestion, exportResults, restartQuiz, showFinalScore, reviewAnswers } from './quizHandlers.js';

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("load-question").addEventListener("click", startQuiz);
  document.getElementById("next-btn").addEventListener("click", nextQuestion);
  document.getElementById("export-results").addEventListener("click", exportResults);
  document.getElementById("restart-quiz").addEventListener("click", restartQuiz);
  document.getElementById("show-final-score").addEventListener("click", showFinalScore);
  document.getElementById("review-answers").addEventListener("click", reviewAnswers);

  const themeToggleBtn = document.getElementById('theme-toggle');

  // Initial text based on current mode
  themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';

  // Toggle theme and button text on click
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggleBtn.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
  });
});
