document.addEventListener("DOMContentLoaded", async function () {

    console.log("Before Loading");
    await loadSavedValues();

    const tokenForm = document.getElementById("tokenForm");

    tokenForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const accessToken = document.getElementById("githubToken").value;
        browser.storage.local.set({ "githubToken": accessToken });
        setFieldSaved("Token");
    });

    const repoForm = document.getElementById("repoForm");

    repoForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const githubRepo = document.getElementById("githubRepo").value;
        browser.storage.local.set({ "githubRepo": githubRepo });
        setFieldSaved("Repo");
    });

    document.getElementById("editToken").addEventListener("click", () => setFieldEditable("Token"));
    document.getElementById("editRepo").addEventListener("click", () => setFieldEditable("Repo"));
});

async function loadSavedValues() {

    console.log("Loading values from localStorage");
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