let allBookmarks = undefined;
document.addEventListener("DOMContentLoaded", async function () {
  
  loadBookmarks();
  document.getElementById("getBookmarksButton").addEventListener("click", loadBookmarks);

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

async function loadBookmarks() {  
  browser.runtime.sendMessage({ action: "getBookmarkFolders", data: undefined }, handleBookmarkReload);
}

async function handleBookmarkReload(bookmarks) {
  //compare with previous version
  allBookmarks = bookmarks;

  const bookmarksList = document.getElementById("bookmarksList");
  bookmarksList.innerHTML = '';
  
  saveBookmarks();

  recursivelyCreateBookmarkElementList(bookmarksList, bookmarks, 0);
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
  input.setAttribute("id", bookmark.id);
  if (bookmark.synced) {
    input.setAttribute("checked", "");
  }

  const label = document.createElement("label");
  label.setAttribute("for", bookmark.title);
  label.textContent = bookmark.title;

  // input.addEventListener("change", function() { console.log(this.checked); })
  input.addEventListener("change", function() { handleBookmarkClick(bookmark.id, this.checked); })

  divWrapper.appendChild(input);
  divWrapper.appendChild(label);
  
  return divWrapper;
}
function handleBookmarkClick(bookmarkId, checked) {
  flattenBookmarkFolders(getBookmarksByParentId(bookmarkId)).forEach((bookmark) => {
    const bookmarkElem = getBookmarkFolderById(bookmark.id);
    bookmarkElem.checked = checked;
    if (bookmark.parentId == bookmarkId && checked) {
      bookmarkElem.style.opacity = 0.5;
      bookmarkElem.style.pointerEvents = "none";
    }
    else if (bookmark.parentId == bookmarkId) {
      bookmarkElem.style.opacity = 1;
      bookmarkElem.style.pointerEvents = "unset";
    }
  });
}
function getBookmarkFolderById(bookmarkId) {
  return document.getElementById(bookmarkId);
} 
function getBookmarksByParentId(parentId) {
  return flattenBookmarkFolders(allBookmarks).filter(bookmark => bookmark.parentId === parentId);
}
function flattenBookmarkFolders(bookmarks) {
   return bookmarks.map(bookmark => {
    return flattenBookmarkFolders(bookmark.children).concat(bookmark);
   }).flat();
}
function findBookmarkFolderChildren(bookmark) {
  return bookmark.children.map(child => {
    return findBookmarkFolderChildren(child).concat(child);
  }).flat();
}


async function saveBookmarks() {
  const bookmarkJson = JSON.stringify(allBookmarks, undefined, 2);
  browser.storage.local.set({ bookmarks: bookmarkJson });
}