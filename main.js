const { app, BrowserWindow, ipcMain, Menu, shell, webFrame } = require("electron");
const path = require("path");
const { customAlphabet } = require("nanoid");
const mongoose = require("mongoose");
require("dotenv").config();
const logitech = require("logitech-led");
const { DICTIONARY } = require(path.join(__dirname, "words"));
const spelling = require("spelling");
const Participant = require(path.join(__dirname, "models/participant"));
const Test = require(path.join(__dirname, "models/test"));

const ALPHABET = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(ALPHABET, 20);
const INITIALCOLOR = { red: 100, green: 100, blue: 100 };
const DICT = new spelling(DICTIONARY);

let numberOfTests = 0;
let minPhraseLength = 0;
let presentedPhrase = "";

const KEYSCANCODE = {
  KeyQ: 16,
  KeyW: 17,
  KeyE: 18,
  KeyR: 19,
  KeyT: 20,
  KeyY: 21,
  KeyU: 22,
  KeyI: 23,
  KeyO: 24,
  KeyP: 25,
  KeyA: 30,
  KeyS: 31,
  KeyD: 32,
  KeyF: 33,
  KeyG: 34,
  KeyH: 35,
  KeyJ: 36,
  KeyK: 37,
  KeyL: 38,
  KeyZ: 44,
  KeyX: 45,
  KeyC: 46,
  KeyV: 47,
  KeyB: 48,
  KeyN: 49,
  KeyM: 50,
  KeySpace: 57,
};

const EMAIL = process.env.EMAIL || "EMAIL";
const DBURI = process.env.DBLINK || "LINK_TO_MONGODB";
// console.log(EMAIL);
// console.log(DBURI);

let currentParticipant = {};
let currentTest = {};

let userInput = "";
let currentWord = "";

logitech.LogiLedInit();
logitech.LogiLedSetLighting(INITIALCOLOR.red, INITIALCOLOR.green, INITIALCOLOR.blue);

const startMenuTemplate = [
  {
    label: "About",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://github.com/AmineAmzil/led-based-word-prediction");
        },
      },
    ],
  },
  {
    label: "Actions",
    id: "action",
    submenu: [
      {
        label: "Close",
        click: () => {
          app.quit();
        },
      },
    ],
  },
];

const testMenuTemplate = [
  {
    label: "About",
    submenu: [
      {
        label: "Learn More",
        click: async () => {
          await shell.openExternal("https://github.com/AmineAmzil/led-based-word-prediction");
        },
      },
    ],
  },
  {
    label: "Actions",
    id: "action",
    submenu: [
      {
        label: "New participant",
        click: getNewParticipant,
      },
      {
        label: "new test",
        click: getNewTest,
      },
      {
        label: "Close",
        click: () => {
          app.quit();
        },
      },
    ],
  },
];

function resetInitColour() {
  const { red, green, blue } = INITIALCOLOR;
  logitech.LogiLedSetLighting(red, green, blue);
}

function recordUserIpnut(event, input) {
  if (input.type == "keyDown") {
    resetInitColour();
    if (KEYSCANCODE[input.code] || input.code === "Space") {
      userInput = userInput + input.key;
    } else if (input.code === "Backspace") {
      userInput = userInput.slice(0, -1);
    } else if (input.code === "Enter" || input.code === "NumpadEnter") {
      if (userInput.length < minPhraseLength) {
        event.preventDefault();
      } else {
        userInput = "";
      }
    }
  }
}

function normalWordPredection(event, input) {
  if (input.type == "keyDown") {
    currentWord = userInput.split(/\s+/g).pop().toLowerCase();
    // console.log("USER INPUT: " + userInput);
    // console.log("CURRENT WORD:" + currentWord);
    if (currentWord.length > 0 && /[a-z]/gi.test(currentWord)) {
      // console.time("SEARCHING TIME");
      const suggestions = [
        ...new Set(
          DICT.search(currentWord, { depth: 25 })
            .map((o) => {
              return o.word;
            })
            .filter((e) => e && e.length > currentWord.length)
            .map((e) => e.split(currentWord)[1])
            .map((e) => e.charAt(0)),
        ),
      ];
      // console.timeEnd("SEARCHING TIME");

      while (suggestions.length > 0) {
        setKeyColor(suggestions.pop().toUpperCase());
      }

      // console.log(DICT.search(currentWord, { depth: 25 }));
    }
  }
}

function enhancedWordPredection(event, input) {
  if (input.type == "keyDown") {
    // console.log("User Input: " + userInput);
    let nextChar = presentedPhrase.split("")[userInput.length];
    if (nextChar) {
      setKeyColor(nextChar);
    }
  }
}

function setKeyColor(ch) {
  let key = ch.toUpperCase();

  if (key === "Y") key = "Z";
  else if (key === "Z") key = "Y";
  else if (key === " ") key = "Space";

  let keyCode = "Key" + key;

  if (KEYSCANCODE[keyCode]) {
    logitech.LogiLedSetLightingForKeyWithScanCode(KEYSCANCODE[keyCode], 0, 100, 0);
  }
}

const changeCondition = (newCondition) => {
  resetInitColour();
  const focusedWin = BrowserWindow.getFocusedWindow();

  userInput = "";
  currentWord = "";

  focusedWin.webContents.removeAllListeners("before-input-event");

  focusedWin.webContents.on("before-input-event", recordUserIpnut);

  if (newCondition === "normal") {
    focusedWin.webContents.on("before-input-event", normalWordPredection);
  } else if (newCondition == "enhanced") {
    focusedWin.webContents.on("before-input-event", enhancedWordPredection);
  }
};

function persistParticipant(participant) {
  const { age, avrageDailyTyping, usedFingers } = participant;
  participant.age = !isNaN(age) ? Number.parseInt(age) : null;
  participant.avrageDailyTyping = !isNaN(avrageDailyTyping) ? Number.parseInt(avrageDailyTyping) : null;
  participant.usedFingers = !isNaN(usedFingers) ? Number.parseInt(usedFingers) : null;
  const p = new Participant(participant);
  return p.save();
}

function persistTest(test) {
  const t = new Test(test);
  return t.save();
}

function getNewParticipant() {
  currentParticipant = {};
  currentTest = {};
  // console.log("WAITING FOR PARTICIANT DATA");
  Menu.setApplicationMenu(Menu.buildFromTemplate(startMenuTemplate));
  BrowserWindow.getFocusedWindow().loadFile(path.join(__dirname, "public/index.html"));
}

function getNewTest() {
  numberOfTests = 0;
  currentTest = {};
  // console.log("WAITING FOR TEST SETTINGS");
  Menu.setApplicationMenu(Menu.buildFromTemplate(testMenuTemplate));
  BrowserWindow.getFocusedWindow().loadFile(path.join(__dirname, "public/testSettings.html"));
}

function launchTest() {
  console.log("TEST IS STARTED");
  const pId = currentParticipant.participantId;
  const testId = currentTest.testId;
  const condition = currentTest.condition;

  changeCondition(condition);

  // console.log("URL SHOULD BE CHANGED:");
  const url = `http://www.asarif.com/resources/WebTEM/#uo=fff&e=${EMAIL}&id=${testId}&c=${condition}&s=${pId}&p=12&kb=ft&st=ftffffff&m=tttttttttttttttttttttfttt&im=ffffffff&o=ffttttffffffftf`;
  // console.log(url);
  BrowserWindow.getFocusedWindow().loadURL(url);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    center: true,
    resizable: false,
    movable: true,
    minimizable: false,
    alwaysOnTop: true,
    minWidth: 800,
    minHeight: 600,
    fullscreen: true,
    width: 900,
    height: 900,
    icon: path.join(__dirname, "/icons", "android-chrome-192x192.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "/public/welcome.html"));
  // mainWindow.webContents.openDevTools();
  Menu.setApplicationMenu(Menu.buildFromTemplate(startMenuTemplate));

  ipcMain.handle("start", getNewParticipant);

  ipcMain.handle("save:participant", (event, participantJsonString) => {
    // console.log("NEW PARTICIPANT OBJECT IS ARRIVED");
    currentParticipant = JSON.parse(participantJsonString);
    currentParticipant.participantId = nanoid();
    // console.log(currentParticipant);
    persistParticipant(currentParticipant)
      .then((result) => {
        // console.log("TRYING TO PERSIST PARTISIPANT DATA IN DATABASE");
        // console.log(result);
        getNewTest();
      })
      .catch((err) => {
        // console.log("PERSISTING PARTICIPANT DATABASE FAILED");
        getNewParticipant();
      });
  });

  ipcMain.handle("save:test", (event, newTestString) => {
    const newTestJson = JSON.parse(newTestString);
    newTestJson.testId = nanoid();
    newTestJson.participantId = currentParticipant.participantId;
    // deep object copying
    currentTest = JSON.parse(JSON.stringify(newTestJson));

    persistTest(currentTest)
      .then((result) => {
        // console.log("TRYING TO PERSIT TEST DATA IN DATABASE");
        // console.log(result);
        launchTest();
      })
      .catch((err) => {
        // console.log("PERSISTING TEST IN DATABASE FAILED");
        getNewTest();
      });
  });

  ipcMain.handle("check:tests", (event) => {
    // console.log("NUMBER OF TEST IS CHECKED");
    // console.log(numberOfTests);
    if (numberOfTests > 0) {
      getNewTest();
    } else {
      numberOfTests += 1;
    }
  });

  ipcMain.handle("change:presentedPhrase", (event, phrase) => {
    presentedPhrase = phrase;
    resetInitColour();
    // console.log("P_Phrase: " + presentedPhrase);
    minPhraseLength = Math.floor(presentedPhrase.length / 3) * 2;
  });
}

//  app events
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows.length === 0) {
      createWindow();
    }
  });
  app.on("window-all-closed", () => {
    app.quit();
  });
  if (EMAIL === "EMAIL" || DBURI === "LINK_TO_MONGODB") {
    app.quit();
  } else {
    mongoose
      .connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then((result) => {
        // console.log("CONNECTING TO REMOTE DATABASE");
        return result;
      })
      .catch((error) => {
        // console.log("CONNECTING TO DATABASE FAILED");
        // console.log(error);
        console.log(error);
        app.quit();
      });
  }
});
