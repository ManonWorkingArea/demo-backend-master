import debug from '@/plugins/Logger.js';

function showToastMessage(message, duration = 3000) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.classList.add('bg-black', 'text-white', 'px-4', 'py-2', 'rounded', 'shadow-md', 'fixed', 'top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2', 'z-50');

  const icon = document.createElement('i');
  icon.classList.add('fas', 'fa-hourglass-start', 'animate-spin', 'mr-2');
  toast.insertBefore(icon, toast.firstChild);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition', 'duration-500');
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, duration);
}

export function handleIdleActivity(callback, timeLimit, showLog) {
  debug.log("Starting idle activity handling...");
  const timeLimitInMilliseconds = timeLimit * 60000;
  const warningThreshold = timeLimitInMilliseconds * 0.4;

  let lastInteractionTime = Date.now();
  let updatedTimeLimit = lastInteractionTime + timeLimitInMilliseconds;

  ["mousemove", "click", "keydown", "scroll", "touchstart"].forEach(event => {
    document.addEventListener(event, () => {
      lastInteractionTime = Date.now();
      updatedTimeLimit = lastInteractionTime + timeLimitInMilliseconds;
      if (showLog) {
        debug.log(`Time limit updated to: ${timeLimit} minutes`);
      }
    });
  });

  setInterval(() => {
    const timeLeft = updatedTimeLimit - Date.now();
    if (timeLeft <= 0) {
      callback();
    } else {
      const minutesLeft = Math.floor(timeLeft / 60000);
      const secondsLeft = Math.floor((timeLeft % 60000) / 1000);
      if (showLog) {
        debug.log(`Time left before session expires: ${minutesLeft}:${secondsLeft < 10 ? "0" : ""}${secondsLeft} min`);
      }
      if (timeLeft < warningThreshold) {
        showToastMessage(`Time left before session expires: ${minutesLeft}:${secondsLeft < 10 ? "0" : ""}${secondsLeft} min`);
      }
    }
  }, 1000);
}
