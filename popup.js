document.addEventListener("DOMContentLoaded", async function () {
  var getBookmarksButton = document.getElementById("getBookmarksButton");
  var bookmarksList = document.getElementById("bookmarksList");
  
  getBookmarksButton.addEventListener("click", function () {
    // Clear existing list
    bookmarksList.innerHTML = '';
  
    // Get bookmarks in "Bookmarks Toolbar" folder
    browser.runtime.sendMessage({ action: "getBookmarkFolders", data: undefined }, function(bookmarks) {

      recursivelyCreateBookmarkElementList(bookmarksList, bookmarks, 0);
    });
  });

  var repoInputField = document.getElementById("githubRepo");
  var tokenInputField = document.getElementById("githubToken");
  const localStorage = await browser.storage.local.get();
  repoInputField.value = localStorage.githubRepo == undefined ? "" : localStorage.githubRepo;
  tokenInputField.value = localStorage.githubToken == undefined ? "" : localStorage.githubToken;

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

  function recursivelyCreateBookmarkElementList(bookmarksList, bookmarks, index) {
    
    bookmarks.forEach(bookmark => {
      bookmarksList.appendChild(createBookmarkElementList(bookmark, index));
      if (bookmark.children.length > 0) {
        recursivelyCreateBookmarkElementList(bookmarksList, bookmark.children, index + 1);
      }
    });
  }
  function createBookmarkElementList(bookmark, childIndex) {
    const divWrapper = document.createElement("div");
    divWrapper.style.paddingLeft = childIndex * 20 + "px";
    
    const input = document.createElement("input");
    input.setAttribute("type", "checkbox");
    input.setAttribute("name", bookmark.title);

    const label = document.createElement("label");
    label.setAttribute("for", bookmark.title);
    label.textContent = bookmark.title;

    divWrapper.appendChild(input);
    divWrapper.appendChild(label);
    
    return divWrapper;
  }
});