const STORAGE_KEY = "meditationApp";
const MIN_SUCCESS_MINUTES = 5;

function emptyState() {
  return { meditationRecords: [] };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { meditationRecords: parsed };
    if (!Array.isArray(parsed.meditationRecords)) return emptyState();
    return parsed;
  } catch (error) {
    return emptyState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getRecords() {
  return loadState().meditationRecords;
}

function saveCompletedSession(dateKey, duration, music) {
  const state = loadState();
  const existing = state.meditationRecords.find((record) => record.date === dateKey);
  if (existing) {
    existing.duration += duration;
    existing.music = music;
  } else {
    state.meditationRecords.push({ date: dateKey, duration, music });
  }
  saveState(state);
  return getRecordByDate(dateKey);
}

function getRecordByDate(dateKey) {
  return getRecords().find((record) => record.date === dateKey) || null;
}

function isSuccessfulDay(record) {
  return Boolean(record && record.duration >= MIN_SUCCESS_MINUTES);
}

function addDays(dateKey, amount) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + amount);
  return toDateKey(date);
}

function getStreak(todayKey = toDateKey()) {
  const map = Object.fromEntries(getRecords().map((record) => [record.date, record]));
  let cursor = todayKey;
  if (!isSuccessfulDay(map[cursor])) {
    cursor = addDays(todayKey, -1);
  }
  let streak = 0;
  while (isSuccessfulDay(map[cursor])) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function getMonthStats(year, month) {
  const records = getRecords().filter((record) => {
    const [y, m] = record.date.split("-").map(Number);
    return y === year && m === month;
  });
  return {
    count: records.length,
    minutes: records.reduce((sum, record) => sum + record.duration, 0),
  };
}

function getChallengeDays(todayKey = toDateKey()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(todayKey, index - 6);
    const record = getRecordByDate(date);
    return {
      date,
      done: isSuccessfulDay(record),
    };
  });
}

function getChallengeProgress(todayKey = toDateKey()) {
  const days = getChallengeDays(todayKey);
  return {
    days,
    completed: days.filter((day) => day.done).length,
  };
}

function formatStreakLabel(streak) {
  if (!streak) return "연속 기록을 시작해 보세요";
  return `🔥 ${streak}일 연속`;
}
