const TRACKS = [
  {
    id: "rain",
    title: "빗소리 피아노",
    videos: { 5: "VBQ1sE1Qwoc", 10: "VBQ1sE1Qwoc", 15: "VBQ1sE1Qwoc" },
    clip: true,
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80",
    period: "day",
  },
  {
    id: "sunset",
    title: "노을 명상",
    videos: { 5: "433Ekmv2wf4", 10: "433Ekmv2wf4", 15: "433Ekmv2wf4" },
    clip: true,
    image:
      "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1400&q=80",
    period: "evening",
  },
  {
    id: "ocean",
    title: "바다 파도",
    videos: { 5: "PgkvwG971hw", 10: "PgkvwG971hw", 15: "PgkvwG971hw" },
    clip: true,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    period: "night",
  },
  {
    id: "deep",
    title: "깊은 이완",
    videos: { 5: "JLcVKyABF4U", 10: "JLcVKyABF4U", 15: "JLcVKyABF4U" },
    clip: true,
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1400&q=80",
    period: "dawn",
  },
  {
    id: "spa",
    title: "스파 오션",
    videos: { 5: "VuUQP86wVwY", 10: "VuUQP86wVwY", 15: "VuUQP86wVwY" },
    clip: true,
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80",
    period: "night",
  },
];

const PERIODS = [
  {
    id: "dawn",
    start: 0,
    end: 459,
    greeting: "고요한 새벽입니다.",
    copy: "숨을 고르고 천천히 시작하세요",
    trackId: "deep",
  },
  {
    id: "morning",
    start: 500,
    end: 859,
    greeting: "좋은 아침입니다.",
    copy: "마음을 잠시 내려놓으세요",
    trackId: "rain",
  },
  {
    id: "day",
    start: 900,
    end: 1659,
    greeting: "좋은 낮입니다.",
    copy: "잠깐의 휴식으로 다시 집중하세요",
    trackId: "rain",
  },
  {
    id: "evening",
    start: 1700,
    end: 1959,
    greeting: "좋은 저녁입니다.",
    copy: "마음을 잠시 내려놓으세요",
    trackId: "sunset",
  },
  {
    id: "night",
    start: 2000,
    end: 2359,
    greeting: "편안한 밤입니다.",
    copy: "하루를 부드럽게 내려놓으세요",
    trackId: "ocean",
  },
];

const WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

function getNow() {
  return new Date();
}

function getPeriod(date = getNow()) {
  const key = date.getHours() * 100 + date.getMinutes();
  return PERIODS.find((period) => key >= period.start && key <= period.end) || PERIODS[0];
}

function getTrack(trackId) {
  return TRACKS.find((track) => track.id === trackId) || TRACKS[0];
}

function getVideoId(track, minutes) {
  return track.videos[minutes] || track.videos[10] || track.videos[5];
}

function formatKoreanDate(date = getNow()) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 · ${WEEKDAYS[date.getDay()]}`;
}

function toDateKey(date = getNow()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isDemoMode() {
  return new URLSearchParams(location.search).get("demo") === "1";
}

function durationSeconds(minutes) {
  return isDemoMode() ? minutes * 2 : minutes * 60;
}
