document.addEventListener("DOMContentLoaded", async function () {

    console.log("Before Loading");
    await loadSavedValues();

    var tokenForm = document.getElementById("tokenForm");

    tokenForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var accessToken = document.getElementById("githubToken").value;
        browser.storage.local.set({ "githubToken": accessToken });
    });

    var repoForm = document.getElementById("repoForm");

    repoForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var githubRepo = document.getElementById("githubRepo").value;
        console.log(githubRepo.value);
        browser.storage.local.set({ "githubRepo": githubRepo.value });
    });
});

async function loadSavedValues() {

    console.log("Loading values from localStorage");
    var repoInputField = document.getElementById("githubRepo");
    var tokenInputField = document.getElementById("githubToken");
    
    const localStorage = await browser.storage.local.get();

    repoInputField.value = localStorage.githubRepo == undefined ? "" : localStorage.githubRepo;
    tokenInputField.value = localStorage.githubToken == undefined ? "" : localStorage.githubToken;
}