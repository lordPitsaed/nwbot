export function startTimeout(duration: number) {
  const startTime = Date.now();
  const timeoutId = setTimeout(() => {
    console.log("[INFO]: Timeout completed");
  }, duration);

  return function getTimeRemaining() {
    if (!startTime || !timeoutId) {
      return 0;
    }
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, duration - elapsedTime);
    return remainingTime;
  };
}
