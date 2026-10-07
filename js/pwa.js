(() => {
  const installCard = document.getElementById("install-card");
  const installBtn = document.getElementById("btn-install");
  const installHint = document.getElementById("install-hint");
  const dismissBtn = document.getElementById("btn-dismiss-install");

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferredPrompt = null;

  if (isStandalone) {
    document.documentElement.classList.add("is-app");
    installCard.classList.add("hidden");
  } else {
    installCard.classList.remove("hidden");
    if (isIos) {
      installBtn.classList.add("hidden");
      installHint.classList.remove("hidden");
    } else {
      installHint.textContent = "Chrome에서 주소창의 설치 아이콘을 누르거나, 설치 버튼을 사용하세요.";
      installHint.classList.remove("hidden");
    }
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    if (!isStandalone) {
      installCard.classList.remove("hidden");
      installBtn.classList.remove("hidden");
    }
  });

  installBtn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installCard.classList.add("hidden");
  });

  dismissBtn.addEventListener("click", () => {
    installCard.classList.add("hidden");
    sessionStorage.setItem("hideInstall", "1");
  });

  if (sessionStorage.getItem("hideInstall") === "1") {
    installCard.classList.add("hidden");
  }
})();
