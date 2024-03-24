let allBookmarks = [];
let bookmarkMap = new Map();

document.addEventListener("DOMContentLoaded", async function () {
  initializeBookmarkLoad();
  document.getElementById("reloadBookmarks").addEventListener("click", () => initializeBookmarkLoad);

  document.getElementById("syncBookmarks").addEventListener("click", () => { syncBookmarks(); });

  document.getElementById("settingButton")
    .addEventListener("click", async () => { await openSettings(); });

  const localStorage = await browser.storage.local.get();
  
  const usernameEntered = localStorage.githubUsername !== undefined && localStorage.githubUsername !== "";
  const tokenEntered = localStorage.githubToken !== undefined && localStorage.githubToken !== "";
  const repoEntered = localStorage.githubRepo !== undefined && localStorage.githubRepo !== "";
  
  if (!usernameEntered || !tokenEntered || !repoEntered) {
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

function syncBookmarks() {
  console.log("Click!");
  browser.runtime.sendMessage({ action: "syncBookmarks", data: undefined });
}

function initializeBookmarkLoad() {
  browser.runtime.sendMessage({ action: "getBookmarkFolders", data: undefined }, handleBookmarkLoad);
}

async function handleBookmarkLoad(bookmarksFromBrowser) {
  const bookmarksFromLocalStorage = await loadBookmarks();
  
  if (bookmarksFromLocalStorage === undefined || bookmarksFromLocalStorage.length == 0) {
    allBookmarks = bookmarksFromBrowser;
  } else {
    allBookmarks = combineBookmarks(bookmarksFromLocalStorage, bookmarksFromBrowser);
  }
  
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
  const divWrapper = document.createElement("div");
  divWrapper.style.paddingLeft = childIndex * 20 + "px";
  
  const input = document.createElement("input");
  input.setAttribute("type", "checkbox");
  input.setAttribute("name", bookmark.title);
  input.setAttribute("id", bookmark.id);
  if (bookmark.synced) {
    input.setAttribute("checked", "");
    if (bookmark.children.length > 0) {
      syncedParentFolderIds.push(bookmark.id);
    }
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
  bookmarkMap.get(bookmarkId).synced = checked;
  getBookmarksByParentId(bookmarkId).forEach(bookmark => bookmarkMap.get(bookmark.id).synced = checked);
  setArray(bookmarkMap);
  renderBookmarkElements(allBookmarks);
  saveBookmarks();
}

function containsId(flatBookmarks, id) {
  return flatBookmarks.filter(bookmark => bookmark.id === id).length > 0;
}
function getBookmarksByParentId(parentId, includeParent) {
  return flatten(allBookmarks).filter(bookmark => bookmark.parentId === parentId || bookmark.id == parentId && includeParent);
}

function setMap(bookmarksAsArray) {
  const bookmarks = createCopy(bookmarksAsArray);
  bookmarkMap = new Map();
  if (bookmarks !== undefined) {
    flatten(bookmarks).forEach((bookmark) => bookmarkMap.set(bookmark.id, bookmark));
  }
}
function setArray(bookmarksAsMap) {
  allBookmarks = [];
  const mapCopy = createCopy(bookmarksAsMap);
  const bookmarksAsArray = unflatten(Array.from(mapCopy.values()));
  allBookmarks = bookmarksAsArray;
}

function combineBookmarks(savedBookmarks, newBookmarks) {
  const flatSavedBookmarks = flatten(savedBookmarks);
  const flatNewBookmarks = flatten(newBookmarks);

  const validSavedBookmarks = flatSavedBookmarks.filter(bookmark => containsId(flatNewBookmarks, bookmark.id)); //detect delted bookmarks
  const validNewBookmarks = flatNewBookmarks.filter(bookmark => !containsId(validSavedBookmarks, bookmark.id)); //filter out only not saved bookmarks
  
  const combinedBookmarks = validSavedBookmarks.concat(validNewBookmarks);
  return unflatten(combinedBookmarks);
}

function flatten(bookmarks) {
  return bookmarks.map(bookmark => {
    const flatChildren = flatten(bookmark.children);
    const parentBookmark = createCopy(bookmark);
    parentBookmark.children = [];
    return flatChildren.concat(parentBookmark);
  }).flat();
}
function unflatten(flatBookmarks) {
  const unflattenBookmarkMap = new Map();
  flatBookmarks.forEach(bookmark => {
    unflattenBookmarkMap.set(bookmark.id, bookmark);
  });

  let unflatBookmarks = [];

  flatBookmarks.forEach(bookmark => {
    if (bookmark.parentId !== undefined) {
      unflattenBookmarkMap.get(bookmark.parentId).children.push(bookmark);
    } else {
      unflatBookmarks.push(bookmark);
    }
  });

  return unflatBookmarks;
}

async function loadBookmarks() {
  const localStorage = await browser.storage.local.get();
  if (localStorage.bookmarks !== undefined) {
    allBookmarks = JSON.parse(localStorage.bookmarks);
  }
  else {
    allBookmarks = undefined;
    bookmarkMap = new Map();
  }
  setMap(allBookmarks);
  return allBookmarks;
}
async function saveBookmarks() {
  const bookmarkJson = JSON.stringify(allBookmarks, undefined, 2);
  browser.storage.local.set({ bookmarks: bookmarkJson });
}

function createCopy(value) {
  return structuredClone(value);
}