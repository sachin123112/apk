export const safeCall = (label, fn) => {
  try {
    return fn();
  } catch (err) {
    console.log(`Crash @ ${label}`, err);
    CrashlyticsService.captureError(new Error(`${label}: ${err?.message}`));
  }
};
