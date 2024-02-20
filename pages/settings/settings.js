document.addEventListener("DOMContentLoaded", async function () {

    await loadValues();

    document.getElementById("tokenForm").addEventListener("submit", (event) => {saveValue("Token"); event.preventDefault();})
    document.getElementById("repoForm").addEventListener("submit", (event) => {saveValue("Repo"); event.preventDefault(); })

    document.getElementById("editToken").addEventListener("click", () => setFieldEditable("Token"));
    document.getElementById("editRepo").addEventListener("click", () => setFieldEditable("Repo"));
});

async function loadValues() {

    const repoInputField = document.getElementById("githubRepo");
    const tokenInputField = document.getElementById("githubToken");
    
    const localStorage = await browser.storage.local.get();

    if (localStorage.githubRepo !== undefined && localStorage.githubRepo !== "") {
        repoInputField.value = localStorage.githubRepo;
        setFieldSaved("Repo");
    }
    if (localStorage.githubToken !== undefined && localStorage.githubToken !== "") {
        tokenInputField.value = localStorage.githubToken;
        setFieldSaved("Token");
    }

    // Debugging
    const bookmarkJsonText = document.getElementById("bookmarkJson");
    bookmarkJsonText.innerHTML = localStorage.bookmarks;
}
function saveValue(fieldName) {
    const fieldValue = document.getElementById("github" + fieldName).value;
    if (fieldName == "Repo") {
        browser.storage.local.set({ "githubRepo": fieldValue });
    } else if (fieldName == "Token") {
        browser.storage.local.set({ "githubToken": fieldValue });
    }
    setFieldSaved(fieldName);
}
function setFieldSaved(fieldName) {
    document.getElementById("github" + fieldName).
        classList.add("not-editable");
    document.getElementById("save" + fieldName)
        .classList.add("hidden");
    document.getElementById("edit" + fieldName)
        .classList.remove("hidden");
}
function setFieldEditable(fieldName) {
    const inputField = document.getElementById("github" + fieldName);
    inputField.classList.remove("not-editable");
    inputField.focus();
    inputField.select();
    document.getElementById("save" + fieldName)
        .classList.remove("hidden");
    document.getElementById("edit" + fieldName)
        .classList.add("hidden");
}