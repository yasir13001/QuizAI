export let timer = null;
export let countdown = 30;
export let questionStartTime = null;
export let questionTimes = [];

export function startTimer() {
  clearInterval(timer);
  countdown = 30;
  document.getElementById("timer").textContent = `Time left: ${countdown}s`;
  timer = setInterval(() => {
    countdown--;
    document.getElementById("timer").textContent = `Time left: ${countdown}s`;
    if (countdown <= 0) {
      clearInterval(timer);
      document.getElementById("timer").textContent = "Time's up!";
      recordTime();
      document.getElementById("next-btn").click();
    }
  }, 1000);
  questionStartTime = Date.now();
}

export function stopTimer() {
  clearInterval(timer);
  document.getElementById("timer").textContent = "";
}

export function recordTime() {
  if (questionStartTime) {
    const timeTaken = Math.min(30, Math.round((Date.now() - questionStartTime) / 1000));
    questionTimes.push(timeTaken);
    questionStartTime = null;
  }
}

export function resetTimer() {
  stopTimer();
  questionTimes = [];
}