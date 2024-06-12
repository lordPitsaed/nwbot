export function startTimeout(duration: number) {
  const startTime = Date.now();
  let timeoutId = setTimeout(() => {
    console.log("[INFO]: Timeout completed");
  }, duration);

  return {
    getTimeRemaining: () => {
      if (!startTime || !timeoutId) {
        return;
      }
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, duration - elapsedTime);

      return remainingTime;
    },
    cancelTimeout: () => {
      clearTimeout(timeoutId);
      timeoutId = undefined as unknown as NodeJS.Timeout;
    },
  };
}
