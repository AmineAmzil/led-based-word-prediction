const conditionForm = document.querySelector("#conditionForm");

conditionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const formJson = Object.fromEntries(formData.entries());
  window.api.persistNewTest(JSON.stringify(formJson));
  // console.log(formJson);
});
