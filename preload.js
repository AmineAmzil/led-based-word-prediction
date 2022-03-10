const { ipcRenderer, contextBridge } = require("electron");
const { nanoid } = require("nanoid");

const myApi = {
  getId: () => nanoid(),
  start: () => ipcRenderer.invoke("start"),
  persistNewParticipant: (participant) => ipcRenderer.invoke("save:participant", participant),
  persistNewTest: (test) => ipcRenderer.invoke("save:test", test),
  changePresentedPhrase: (phrase) => ipcRenderer.invoke("change:presentedPhrase", phrase),
};

contextBridge.exposeInMainWorld("api", myApi);

window.onload = () => {
  const startBtn = document.getElementById("start");
  const defaultBtn = document.getElementById("default");
  const checkBtn = document.getElementById("check");
  const backBtn = document.getElementById("back");
  const input_area = document.getElementById("input_area");
  const p_phrase = document.getElementById("p_phrase");

  if (startBtn) {
    ipcRenderer.invoke("check:tests");
    startBtn.addEventListener("click", () => {
      // console.log("START BTN IS CLICKED");
    });
    startBtn.click();
  }
  if (defaultBtn) {
    defaultBtn.remove();
  }
  if (checkBtn) {
    checkBtn.remove();
  }
  if (backBtn) {
    backBtn.remove();
    document.querySelector("html").style.height = "auto";
    document.querySelector("body").style.height = "auto";
    document.querySelector("#content").style.paddingTop = "40%";
  }

  if (p_phrase) {
    const config = {
      childList: true,
      subtree: true,
      characterData: true,
    };
    const observer = new MutationObserver(function (mutations) {
      myApi.changePresentedPhrase(p_phrase.innerHTML);
    });
    observer.observe(p_phrase, config);
  }
};
