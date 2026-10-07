(() => {
  const screens = {
    home: document.getElementById("screen-home"),
    session: document.getElementById("screen-session"),
    calendar: document.getElementById("screen-calendar"),
    challenge: document.getElementById("screen-challenge"),
  };

  const tabBar = document.getElementById("tab-bar");
  const homeBg = document.getElementById("home-bg");
  const homeDate = document.getElementById("home-date");
  const homeGreeting = document.getElementById("home-greeting");
  const homeCopy = document.querySelector(".home-copy");
  const homeStreak = document.getElementById("home-streak");
  const trackList = document.getElementById("track-list");
  const sessionTitle = document.getElementById("session-title");
  const sessionTimer = document.getElementById("session-timer");
  const pauseBtn = document.getElementById("btn-pause");
  const sessionDone = document.getElementById("session-done");
  const doneSummary = document.getElementById("done-summary");
  const calendarGrid = document.getElementById("calendar-grid");
  const calendarMonth = document.getElementById("calendar-month");
  const calendarStreak = document.getElementById("calendar-streak");
  const monthCount = document.getElementById("month-count");
  const monthMinutes = document.getElementById("month-minutes");
  const dayDetail = document.getElementById("day-detail");
  const challengeRatio = document.getElementById("challenge-ratio");
  const challengeDots = document.getElementById("challenge-dots");
  const challengeStreak = document.getElementById("challenge-streak");
  const sessionUi = document.querySelector(".session-ui");
  const sessionBg = document.getElementById("session-bg");
  const confirmEnd = document.getElementById("confirm-end");
  let ytFrame = document.getElementById("yt-frame");
  let ytPlayer = null;
  let ytApiReady = null;

  let selectedMinutes = 10;
  let currentPeriod = getPeriod();
  let selectedTrack = getTrack(currentPeriod.trackId);
  let timer = null;
  let viewYear = getNow().getFullYear();
  let viewMonth = getNow().getMonth() + 1;
  let selectedDateKey = toDateKey();
  let isPaused = false;

  function showScreen(name) {
    Object.values(screens).forEach((screen) => screen.classList.remove("active"));
    screens[name].classList.add("active");
    tabBar.classList.toggle("hidden", name === "session");
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === name);
    });
  }

  function renderHome() {
    currentPeriod = getPeriod();
    homeBg.style.backgroundImage = `url("${selectedTrack.image}")`;
    homeDate.textContent = formatKoreanDate();
    homeGreeting.textContent = currentPeriod.greeting;
    homeCopy.textContent = currentPeriod.copy;
    homeStreak.textContent = formatStreakLabel(getStreak());
    renderTracks();
  }

  function renderTracks() {
    trackList.innerHTML = TRACKS.map(
      (track) => `
        <button type="button" class="track-btn ${track.id === selectedTrack.id ? "selected" : ""}" data-track="${track.id}">
          ${track.title}
        </button>
      `
    ).join("");
    trackList.querySelectorAll(".track-btn").forEach((button) => {
      button.addEventListener("click", () => {
        selectedTrack = getTrack(button.dataset.track);
        homeBg.style.backgroundImage = `url("${selectedTrack.image}")`;
        renderTracks();
      });
    });
  }

  function currentVideo() {
    return {
      videoId: getVideoId(selectedTrack, selectedMinutes),
      seconds: durationSeconds(selectedMinutes),
      clip: Boolean(selectedTrack.clip),
    };
  }

  function loadYouTubeApi() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiReady) return ytApiReady;
    ytApiReady = new Promise((resolve) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === "function") previous();
        resolve();
      };
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(script);
    });
    return ytApiReady;
  }

  function syncTimerWithPlayer(state) {
    if (!timer) return;
    if (state === 2) {
      timer.pause();
      isPaused = true;
      pauseBtn.textContent = "명상 이어하기";
    } else if (state === 1) {
      timer.resume();
      isPaused = false;
      pauseBtn.textContent = "명상 일시정지";
    }
  }

  function playTrackNow(videoId, seconds, clip) {
    const wrap = document.getElementById("yt-wrap");
    if (ytPlayer && typeof ytPlayer.destroy === "function") {
      ytPlayer.destroy();
      ytPlayer = null;
    }
    wrap.replaceChildren();
    const next = document.createElement("iframe");
    next.id = "yt-frame";
    next.className = "yt-frame";
    next.title = "명상 음악";
    next.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    next.setAttribute("allowfullscreen", "");
    next.referrerPolicy = "strict-origin-when-cross-origin";
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "0",
      controls: "1",
      rel: "0",
      playsinline: "1",
      modestbranding: "1",
      enablejsapi: "1",
      origin: location.origin,
      widget_referrer: location.origin,
    });
    if (clip) params.set("end", String(seconds));
    next.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
    wrap.appendChild(next);
    ytFrame = next;

    loadYouTubeApi().then(() => {
      if (ytFrame !== next) return;
      ytPlayer = new YT.Player("yt-frame", {
        events: {
          onStateChange: (event) => syncTimerWithPlayer(event.data),
        },
      });
    });
  }

  window.addEventListener("message", (event) => {
    if (event.origin !== "https://www.youtube.com") return;
    let payload = event.data;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (error) {
        return;
      }
    }
    if (!payload) return;
    if (payload.event === "onStateChange" && typeof payload.info === "number") {
      syncTimerWithPlayer(payload.info);
    }
  });

  function sendYouTube(command) {
    if (ytPlayer && typeof ytPlayer[command] === "function") {
      ytPlayer[command]();
      return;
    }
    if (!ytFrame || !ytFrame.contentWindow) return;
    ytFrame.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: command, args: [] }),
      "*"
    );
  }

  function startSession() {
    const { videoId, seconds, clip } = currentVideo();
    isPaused = false;
    sessionDone.classList.add("hidden");
    sessionUi.classList.remove("hidden");
    sessionTitle.textContent = `${selectedTrack.title} · ${selectedMinutes}분`;
    sessionBg.style.backgroundImage = `url("${selectedTrack.image}")`;
    pauseBtn.textContent = "명상 일시정지";
    showScreen("session");
    sessionTimer.textContent = formatClock(seconds);
    playTrackNow(videoId, seconds, clip);

    timer = createTimer({
      seconds,
      onTick: (remaining) => {
        sessionTimer.textContent = formatClock(remaining);
      },
      onComplete: completeSession,
    });
    timer.start();
  }

  function togglePause() {
    if (!timer) return;
    sendYouTube(isPaused ? "playVideo" : "pauseVideo");
  }

  function stopPlayer() {
    sendYouTube("pauseVideo");
    if (ytPlayer && typeof ytPlayer.destroy === "function") {
      ytPlayer.destroy();
      ytPlayer = null;
    }
    if (ytFrame) ytFrame.src = "";
  }

  function leaveSession() {
    if (timer) timer.stop();
    timer = null;
    stopPlayer();
    confirmEnd.classList.add("hidden");
    sessionDone.classList.add("hidden");
    sessionUi.classList.remove("hidden");
    showScreen("home");
    renderHome();
  }

  function completeSession() {
    stopPlayer();
    saveCompletedSession(toDateKey(), selectedMinutes, selectedTrack.title);
    doneSummary.textContent = `${selectedMinutes}분 · ${selectedTrack.title}`;
    sessionUi.classList.add("hidden");
    sessionDone.classList.remove("hidden");
    renderHome();
    renderCalendar();
    renderChallenge();
  }

  function abandonSession() {
    leaveSession();
  }

  function renderCalendar() {
    calendarMonth.textContent = `${viewYear}년 ${viewMonth}월`;
    calendarStreak.textContent = formatStreakLabel(getStreak());
    const stats = getMonthStats(viewYear, viewMonth);
    monthCount.textContent = `${stats.count}회`;
    monthMinutes.textContent = `${stats.minutes}분`;

    const first = new Date(viewYear, viewMonth - 1, 1);
    const lastDate = new Date(viewYear, viewMonth, 0).getDate();
    const todayKey = toDateKey();
    calendarGrid.innerHTML = "";

    for (let i = 0; i < first.getDay(); i += 1) {
      const empty = document.createElement("div");
      empty.className = "day-cell empty";
      calendarGrid.appendChild(empty);
    }

    for (let day = 1; day <= lastDate; day += 1) {
      const key = `${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const record = getRecordByDate(key);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day-cell";
      if (key === todayKey) cell.classList.add("today");
      if (key === selectedDateKey) cell.classList.add("selected");
      cell.innerHTML = `<span>${day}</span>${record ? '<span class="dot"></span>' : ""}`;
      cell.addEventListener("click", () => {
        selectedDateKey = key;
        renderCalendar();
      });
      calendarGrid.appendChild(cell);
    }

    renderDayDetail(selectedDateKey);
  }

  function renderDayDetail(dateKey) {
    const record = getRecordByDate(dateKey);
    const date = new Date(`${dateKey}T00:00:00`);
    const title = `${date.getMonth() + 1}월 ${date.getDate()}일`;
    if (!record) {
      dayDetail.innerHTML = `<h3>${title}</h3><p>아직 명상 기록이 없습니다.</p>`;
      return;
    }
    dayDetail.innerHTML = `
      <h3>${title}</h3>
      <p>명상 완료 ✓</p>
      <p>명상 시간 ${record.duration}분</p>
      <p>사용한 음악 ${record.music}</p>
    `;
  }

  function renderChallenge() {
    const progress = getChallengeProgress();
    challengeRatio.textContent = `${progress.completed} / 7일`;
    challengeDots.innerHTML = progress.days
      .map((day) => `<span class="${day.done ? "done" : ""}" title="${day.date}"></span>`)
      .join("");
    challengeStreak.textContent = formatStreakLabel(getStreak());
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      selectedMinutes = Number(chip.dataset.minutes);
      document.querySelectorAll(".chip").forEach((item) => item.classList.remove("selected"));
      chip.classList.add("selected");
    });
  });

  document.getElementById("btn-start").addEventListener("click", startSession);
  pauseBtn.addEventListener("click", togglePause);
  document.getElementById("btn-back").addEventListener("click", leaveSession);
  document.getElementById("btn-end").addEventListener("click", leaveSession);
  document.getElementById("btn-cancel-end").addEventListener("click", () => {
    confirmEnd.classList.add("hidden");
  });
  document.getElementById("btn-confirm-end").addEventListener("click", leaveSession);
  document.getElementById("btn-done-home").addEventListener("click", leaveSession);
  document.getElementById("btn-challenge-home").addEventListener("click", () => {
    showScreen("home");
    renderHome();
  });
  document.getElementById("btn-prev-month").addEventListener("click", () => {
    viewMonth -= 1;
    if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    renderCalendar();
  });
  document.getElementById("btn-next-month").addEventListener("click", () => {
    viewMonth += 1;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    }
    renderCalendar();
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.dataset.tab;
      if (name === "calendar") renderCalendar();
      if (name === "challenge") renderChallenge();
      if (name === "home") renderHome();
      showScreen(name);
    });
  });

  renderHome();
  renderCalendar();
  renderChallenge();
})();
