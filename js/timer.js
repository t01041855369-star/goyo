function createTimer({ seconds, onTick, onComplete }) {
  let remaining = seconds;
  let paused = false;
  let intervalId = null;

  function tick() {
    if (paused) return;
    remaining -= 1;
    onTick(remaining);
    if (remaining <= 0) {
      stop();
      onComplete();
    }
  }

  function start() {
    onTick(remaining);
    intervalId = setInterval(tick, 1000);
  }

  function pause() {
    paused = true;
  }

  function resume() {
    paused = false;
  }

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
  }

  function isPaused() {
    return paused;
  }

  return { start, pause, resume, stop, isPaused };
}

function formatClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
