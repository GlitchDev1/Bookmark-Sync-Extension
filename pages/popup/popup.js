document.addEventListener("DOMContentLoaded", async function () {
  
  document.getElementById("getBookmarksButton").addEventListener("click", getBookmarks);
  getBookmarks();

  document.getElementById("settingButton")
    .addEventListener("click", async () => { await openSettings(); });

  const localStorage = await browser.storage.local.get();
  if (localStorage.githubRepo === undefined || localStorage.githubRepo === "" || localStorage.githubToken === undefined || localStorage.githubToken === "") {
    await openSettings();
  }
});

async function openSettings() {
  await browser.tabs.create({
    active: true,
    url: '/pages/settings/settings.html'
  });
  window.close();
}

async function getBookmarks() {
  const bookmarksList = document.getElementById("bookmarksList");
  bookmarksList.innerHTML = '';
  
  browser.runtime.sendMessage({ action: "getBookmarkFolders", data: undefined }, function(bookmarks) {
    recursivelyCreateBookmarkElementList(bookmarksList, bookmarks, 0);
  });
}

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