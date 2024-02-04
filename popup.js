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
          li.textContent = bookmark.title;
          bookmarksList.appendChild(li);
        });
      });
    });

    var settingsForm = document.getElementById("settingsForm");
    var repoInputField = document.getElementById("githubRepo");

    repoInputField.value = (await browser.storage.local.get()).githubRepo;
  
    settingsForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var githubRepo = document.getElementById("githubRepo").value;
  
      // Save GitHub repository details to browser storage
      browser.storage.local.set({ "githubRepo": githubRepo });
    });
  });