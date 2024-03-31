document.addEventListener("DOMContentLoaded", async function () {

    await loadValues();

    document.getElementById("revealToken").addEventListener("change", () => toggleTokenReveal(this.checked) );

    document.getElementById("usernameForm").addEventListener("submit", (event) => {saveValue("Username"); event.preventDefault();})
    document.getElementById("tokenForm").addEventListener("submit", (event) => {saveValue("Token"); event.preventDefault();})
    document.getElementById("repoForm").addEventListener("submit", (event) => {saveValue("Repo"); event.preventDefault(); })

    document.getElementById("editUsername").addEventListener("click", () => setFieldEditable("Username"));
    document.getElementById("editToken").addEventListener("click", () => setFieldEditable("Token"));
    document.getElementById("editRepo").addEventListener("click", () => setFieldEditable("Repo"));

    document.getElementById("resetBookmarks").addEventListener("click", () => resetBookmarks());

    document.getElementById("debuggingTitle").addEventListener("click", () => toggleCollapsible());
});

async function loadValues() {

    const usernameInputField = document.getElementById("githubUsername");
    const repoInputField = document.getElementById("githubRepo");
    const tokenInputField = document.getElementById("githubToken");
    
    const localStorage = await browser.storage.local.get();

    if (localStorage.githubUsername !== undefined && localStorage.githubUsername !== "") {
        usernameInputField.value = localStorage.githubUsername;
        setFieldSaved("Username");
    }
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
    switch (fieldName) {
        case "Username":
            browser.storage.local.set({ "githubUsername": fieldValue });
            break;
        case "Repo":
            browser.storage.local.set({ "githubRepo": fieldValue });
            break;
        case "Token":
            browser.storage.local.set({ "githubToken": fieldValue });
            break;
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

    if (fieldName == "Token") {
        document.getElementById("githubToken").setAttribute("type", "password");
    }

    document.getElementById("edit" + fieldName).focus();
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
async function resetBookmarks() {
    await browser.storage.local.set({ "bookmarks": [] });
    loadValues();
}

let open = false;
function toggleCollapsible() {
    const collapsibleObj = document.getElementById("debuggingCollapsible");
    if (open) {
        collapsibleObj.classList.remove("collapsible-open");
    } else {
        collapsibleObj.classList.add("collapsible-open");
    }
    open = !open;
}
function toggleTokenReveal() {
    const tokenInput = document.getElementById("githubToken");
    const shown = tokenInput.getAttribute("type") == "text";
    tokenInput.setAttribute("type", shown ? "password" : "text");
}