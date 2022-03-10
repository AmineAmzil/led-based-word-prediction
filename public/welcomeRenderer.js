const startBtn = document.getElementById("startBtn");

const startSession = () => {
  window.api.start();
};

startBtn.addEventListener("click", startSession);
