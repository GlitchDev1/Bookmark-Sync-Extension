document.addEventListener("DOMContentLoaded", async function () {
    var getBookmarksButton = document.getElementById("getBookmarksButton");
    var bookmarksList = document.getElementById("bookmarksList");
  
    getBookmarksButton.addEventListener("click", function () {
    // Clear existing list
    bookmarksList.innerHTML = '';
  
    // Get bookmarks in "Bookmarks Toolbar" folder
    browser.bookmarks.getChildren("toolbar_____").then(bookmarks => {
      bookmarks.forEach(bookmark => {
        var li = document.createElement("li");
        li.textContent = bookmark.title + " - " + bookmark.url;
        bookmarksList.appendChild(li);
      });
    });
});

    var repoInputField = document.getElementById("githubRepo");
    var tokenInputField = document.getElementById("githubToken");
    repoInputField.value = (await browser.storage.local.get()).githubRepo;
    tokenInputField.value = (await browser.storage.local.get()).githubToken;

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
      browser.storage.local.set({ "githubRepo": githubRepo.value });
    });
  });