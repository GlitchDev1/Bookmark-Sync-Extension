let allBookmarks = [];
document.addEventListener("DOMContentLoaded", async function () {
  
  initializeBookmarkLoad();
  document.getElementById("getBookmarksButton").addEventListener("click", () => initializeBookmarkLoad);

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

function initializeBookmarkLoad() {
  browser.runtime.sendMessage({ action: "getBookmarkFolders", data: undefined }, handleBookmarkLoad);
}

async function handleBookmarkLoad(bookmarks) {
  const bookmarksFromLocalStorage = await loadBookmarks();
  if (bookmarksFromLocalStorage === undefined) {
    allBookmarks = bookmarks;
  } else {
    allBookmarks = combineBookmarks(JSON.parse(bookmarksFromLocalStorage), bookmarks);
  }

  console.log("Bookmark folders from browser: " + JSON.stringify(bookmarks));
  console.log("Bookmark folders from localstorage: " + JSON.stringify(allBookmarks));
  
  renderBookmarkElements(allBookmarks);
  saveBookmarks();
}

function renderBookmarkElements(bookmarks) {
  const bookmarksList = document.getElementById("bookmarksList");
  bookmarksList.innerHTML = '';

  syncedParentFolderIds = [];

  recursivelyCreateBookmarkElementList(bookmarksList, bookmarks, 0);
}

let syncedParentFolderIds = [];
function recursivelyCreateBookmarkElementList(bookmarksList, bookmarks, index) {  
  bookmarks.forEach(bookmark => {
    bookmarksList.appendChild(createBookmarkElement(bookmark, index));
    if (bookmark.children.length > 0) {
      recursivelyCreateBookmarkElementList(bookmarksList, bookmark.children, index + 1);
    }
  });
}

function createBookmarkElement(bookmark, childIndex) {
  if (bookmark.synced && bookmark.children.length > 0) {
    syncedParentFolderIds.push(bookmark.id);
  }

  const divWrapper = document.createElement("div");
  divWrapper.style.paddingLeft = childIndex * 20 + "px";
  
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.setAttribute("name", bookmark.title);
  input.setAttribute("id", bookmark.id);
  if (bookmark.synced) {
    input.setAttribute("checked", "");syncedParentFolderIds
  }
  if (syncedParentFolderIds.includes(bookmark.parentId)) {
    input.classList.add("checkbox-unclickable");
  }

  const label = document.createElement("label");
  label.setAttribute("for", bookmark.title);
  label.textContent = bookmark.title;

  input.addEventListener("change", function() { handleBookmarkClick(bookmark.id, this.checked); })

  divWrapper.appendChild(input);
  divWrapper.appendChild(label);
  
  return divWrapper;
}
function handleBookmarkClick(bookmarkId, checked) {
  flattenBookmarkFolders(getBookmarksByParentId(bookmarkId, true)).forEach((bookmark) => {
    bookmark.synced = checked;
  });
  renderBookmarkElements(allBookmarks);
  saveBookmarks();
}
function getBookmarkElementById(bookmarkId) {
  return document.getElementById(bookmarkId);
} 
function getBookmarksByParentId(parentId, includeParent) {
  return flattenBookmarkFolders(allBookmarks).filter(bookmark => bookmark.parentId === parentId || bookmark.id == parentId && includeParent);
}
function findBookmarkFolderChildren(bookmark) {
  return bookmark.children.map(child => {
    return findBookmarkFolderChildren(child).concat(child);
  }).flat();
}

function flattenBookmarkFolders(bookmarks) {
   return bookmarks.map(bookmark => {
    return flattenBookmarkFolders(bookmark.children).concat(bookmark);
   }).flat();
}
function unFlattenBookmarkFolders(flatBookmarks) {
  const bookmarkMap = {};
  flatBookmarks.forEach(bookmark => {
    bookmarkMap[bookmark.id] = bookmark;
  });

  let unflatBookmarks = [];

  unflatBookmarks = flatBookmarks.forEach(bookmark => {
    // Get all the top level bookmarks
    if (bookmark.parentId === undefined) {
      bookmarkMap[bookmark.id].children.push(bookmark);
    } else {
      unflatBookmarks.push(bookmark);
    }
  
  });

  return unflatBookmarks.map(bookmark => bookmarkMap[bookmark.id]);

  // unflatBookmarks = unflatBookmarks.map(bookmark => {
  //   return getBookmarksByParentIdFromFlat(flatBookmarks, bookmark.id, true);
  // });
}
function getBookmarksByParentIdFromFlat(flatBookmarks, parentId, includeParent) {
  return flatBookmarks.filter(bookmark => bookmark.parentId === parentId || bookmark.id == parentId && includeParent);
}


function combineBookmarks(savedBookmarks, newBookmarks) {
  const flatSavedBookmarks = flattenBookmarkFolders(savedBookmarks);
  const flatNewBookmarks = flattenBookmarkFolders(newBookmarks);

  const validSavedBookmarks = flatSavedBookmarks.filter(bookmark => containsId(flatNewBookmarks, bookmark.id)); //detect delted bookmarks
  const validNewBookmarks = flatNewBookmarks.filter(bookmark => !containsId(validSavedBookmarks, bookmark.id)); //filter out only not saved bookmarks
  
  const combinedBookmarks = validSavedBookmarks.concat(validNewBookmarks);
  return unFlattenBookmarkFolders(combinedBookmarks);
}
function containsId(flatBookmarks, id) {
  return flatBookmarks.filter(bookmark => bookmark.id === id).length > 0;
}

async function loadBookmarks() {
  const localStorage = await browser.storage.local.get();
  return localStorage.bookmarks;
}
async function saveBookmarks() {
  const bookmarkJson = JSON.stringify(allBookmarks, undefined, 2);
  browser.storage.local.set({ bookmarks: bookmarkJson });
}