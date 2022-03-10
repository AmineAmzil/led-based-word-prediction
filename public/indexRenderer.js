import languages from "./languages.js";

const nativeLanguageSelect = document.querySelector("#nativeLanguage");
const participantInfo = document.querySelector("#participantInfo");

participantInfo.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formJson = Object.fromEntries(formData.entries());
  window.api.persistNewParticipant(JSON.stringify(formJson));
});

const createOption = (key, value) => {
  const newOption = document.createElement("option");
  newOption.value = value.name.toLowerCase();
  newOption.innerText = value.name;
  return newOption;
};

Object.entries(languages).forEach(([key, value]) => {
  nativeLanguageSelect.options.add(createOption(key, value));
});
