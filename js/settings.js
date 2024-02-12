document.addListener("DOMContentLoaded", async function () {

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