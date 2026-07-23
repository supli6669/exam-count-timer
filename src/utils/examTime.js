export function calculateTimeLeft(datetime, now = Date.now()) {
  const difference = new Date(datetime).getTime() - now;
  if (!Number.isFinite(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true, totalMs: difference };
  }
  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isPassed: false,
    totalMs: difference
  };
}
